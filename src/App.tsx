import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import { Leva } from "leva";
import { useControls } from "./hooks/use-controls";

import { Perf } from "r3f-perf";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  useBeforePhysicsStep,
} from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { Vector3 } from "three";
import { ScrollControls, useScroll, OrbitControls } from "@react-three/drei";

import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

import Vehicle, { VehicleRef } from "./components/Vehicle";
import MainText from "./components/MainText";

type Props = {
  isKeydown: boolean;
  maxForceMobile: number;
  steeringMobile: number;
};

const CameraAndControlVehicle = ({
  isKeydown,
  maxForceMobile,
  steeringMobile,
}: Props) => {
  const { cameraMode } = useLeva("camera", {
    cameraMode: {
      value: "drive",
      options: ["drive", "orbit"],
    },
  });
  const controls = useControls();
  const scroll = useScroll();

  const cameraIdealOffset = new Vector3();
  const cameraIdealLookAt = new Vector3();
  const chassisTranslation = new Vector3();

  const raycastVehicle = useRef<VehicleRef>(null);

  const camera = useThree((state) => state.camera);
  const currentCameraPosition = useRef(new Vector3(15, 15, 0));
  const currentCameraLookAt = useRef(new Vector3());

  const maxForce = 100;
  const maxBrake = 0.3;
  const maxSteer = 0.7;

  const stepSteer = 0.002;
  let steer = 0;

  useBeforePhysicsStep((world) => {
    if (
      !raycastVehicle.current ||
      !raycastVehicle.current.rapierRaycastVehicle.current
    ) {
      return;
    }

    const {
      wheels,
      rapierRaycastVehicle: { current: vehicle },
      setBraking,
    } = raycastVehicle.current;

    // update wheels from controls
    let engineForce = 0;
    let steering = 0;

    if (isMobile) {
      engineForce += maxForceMobile;
      steering += steeringMobile;
    } else {
      if (controls.current.forward) {
        engineForce += maxForce;
      }
      if (controls.current.backward) {
        engineForce -= maxForce;
      }

      if (controls.current.left) {
        if (steer < maxSteer) {
          steer += stepSteer;
        }
        steering = steer;
      }

      if (!controls.current.left) {
        if (steer > stepSteer) {
          steer -= stepSteer;
        }
        steering = steer;
      }

      if (controls.current.right) {
        if (steer > -maxSteer) {
          steer -= stepSteer;
        }
        steering = steer;
      }

      if (!controls.current.right) {
        if (steer < -stepSteer) {
          steer += stepSteer;
        }
        steering = steer;
      }
    }

    const brakeForce = controls.current.brake ? maxBrake : 0;

    for (let i = 0; i < vehicle.wheels.length; i++) {
      vehicle.setBrakeValue(brakeForce, i);
    }

    // steer front wheels
    vehicle.setSteeringValue(steering, 0);
    vehicle.setSteeringValue(steering, 1);

    // apply engine force to back wheels
    vehicle.applyEngineForce(engineForce, 2);
    vehicle.applyEngineForce(engineForce, 3);

    // update the vehicle
    vehicle.update(world.timestep);

    // update the wheels
    for (let i = 0; i < vehicle.wheels.length; i++) {
      const wheelObject = wheels[i].object.current;
      if (!wheelObject) continue;

      const wheelState = vehicle.wheels[i].state;
      wheelObject.position.copy(wheelState.worldTransform.position);
      wheelObject.quaternion.copy(wheelState.worldTransform.quaternion);
    }

    // TODO need to brake or speed text?
    // update speed text
    // if (currentSpeedTextDiv.current) {
    //     const km = Math.abs(
    //         vehicle.state.currentVehicleSpeedKmHour
    //     ).toFixed()
    //     currentSpeedTextDiv.current.innerText = `${km} km/h`
    // }

    // update brake lights
    // setBraking(brakeForce > 0);
  });

  useFrame((state, delta) => {
    if (cameraMode !== "drive") return;
    const chassis = raycastVehicle.current?.chassisRigidBody;
    if (!chassis?.current) return;

    const ratioScreen = window.innerHeight / window.innerWidth;
    const calculatedCoefficientScale = () => {
      if (ratioScreen > 0.5 && ratioScreen < 1)
        return Math.pow(ratioScreen, 3) * 4;
      if (ratioScreen > 1) return ratioScreen * 3;
      return Math.pow(ratioScreen, 3);
    };

    const calcCoefficientY = ratioScreen > 1 ? 9 : 3;

    chassisTranslation.copy(chassis.current.translation() as Vector3);

    const scrollPosition = scroll.offset * 2 * 100 - 100;
    const scrollOrVehiclePosition = isKeydown
      ? chassisTranslation.x
      : scrollPosition;

    const scrollOrVehiclePositionZ = isKeydown ? 0.3 * chassisTranslation.z : 0;

    const t = 1 - Math.pow(0.01, delta);

    cameraIdealOffset.set(20, 20, 0);
    cameraIdealOffset.addScaledVector(
      new THREE.Vector3(10, calcCoefficientY, 0),
      calculatedCoefficientScale()
    );
    cameraIdealOffset.add(new THREE.Vector3(scrollOrVehiclePosition, 0, 0));

    cameraIdealLookAt.set(10, 10, 0);
    cameraIdealLookAt.add(
      new THREE.Vector3(scrollOrVehiclePosition, 0, scrollOrVehiclePositionZ)
    );

    currentCameraPosition.current.lerp(cameraIdealOffset, t);
    currentCameraLookAt.current.lerp(cameraIdealLookAt, t);

    camera.position.copy(currentCameraPosition.current);
    camera.lookAt(currentCameraLookAt.current);
  });

  return (
    <>
      {cameraMode === "orbit" && <OrbitControls />}
      <Vehicle ref={raycastVehicle} />
    </>
  );
};

export default function App() {
  const { perfVisible, debug } = useLeva({
    perfVisible: false,
    debug: false,
  });
  const [isKeydown, setKeydown] = useState(true);

  useEffect(() => {
    const clickListener = (e: { code: string; preventDefault: () => void }) => {
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
          e.code
        ) > -1
      ) {
        setKeydown(true);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", clickListener);

    return () => document.removeEventListener("keydown", clickListener);
  }, []);

  useEffect(() => {
    const appCanvas = document.getElementById("appCanvas");
    const clickListener = () => setKeydown(false);
    document.addEventListener("wheel", clickListener);
    appCanvas?.addEventListener("touchmove", clickListener);

    return () => {
      document.removeEventListener("wheel", clickListener);
      appCanvas?.removeEventListener("touchmove", clickListener);
    };
  }, []);

  const [maxForceMobile, setMaxForceMobile] = useState(0);
  const [steeringMobile, setSteeringMobile] = useState(0);
  const maxForce = 100;
  const maxSteer = 0.3;

  const moveHandler = (event: IJoystickUpdateEvent) => {
    if (!event.y || !event.x) return;
    setMaxForceMobile(maxForce * event?.y);
    setSteeringMobile(maxSteer * -event?.x);
    setKeydown(true);
  };

  const moveHandlerStop = () => {
    setMaxForceMobile(0);
    setSteeringMobile(0);
  };

  return (
    <>
      <Leva collapsed />
      {isMobile && (
        <JoystikStyled>
          <Joystick size={100} move={moveHandler} stop={moveHandlerStop} />
        </JoystikStyled>
      )}
      <Canvas
        frameloop="demand" // TODO ?
        dpr={[1, 2]} // default pixelRatio //TODO need?
        camera={{
          fov: 35,
        }}
        shadows
        id="appCanvas"
      >
        {perfVisible && <Perf position="top-left" />}
        <ScrollControls pages={2}>
          <Physics
            timeStep={1 / 400}
            updatePriority={-50}
            gravity={[0, -9.08, 0]}
            debug={debug}
          >
            {/* Lights */}
            <directionalLight castShadow position={[10, 4, 3]} intensity={3} />
            <ambientLight intensity={2.9} />

            {/* Main text */}
            <MainText />

            {/* Vehicle with Camera and Controls hooks */}
            <CameraAndControlVehicle
              isKeydown={isKeydown}
              maxForceMobile={maxForceMobile}
              steeringMobile={steeringMobile}
            />

            {/* Web-site boundary */}
            <RigidBody colliders="cuboid" type="fixed">
              <mesh receiveShadow position={[1, 0, 15]} rotation-x={0.1}>
                <boxGeometry args={[200, 3, 1]} />
                <meshStandardMaterial color="#ce0300" />
              </mesh>
              <mesh receiveShadow position={[1, 0, -15]} rotation-x={-0.1}>
                <boxGeometry args={[200, 3, 1]} />
                <meshStandardMaterial color="#ce0300" />
              </mesh>
            </RigidBody>

            {/* Ground */}
            <RigidBody
              type="fixed"
              colliders={false}
              friction={1}
              position={[0, -2, 0]}
              restitution={0.3}
            >
              <CuboidCollider args={[100, 0.5, 15]} />
              <mesh receiveShadow>
                <boxGeometry args={[200, 1, 30]} />
                <meshStandardMaterial color="#4e69b9" />
              </mesh>
            </RigidBody>
          </Physics>
        </ScrollControls>
      </Canvas>
    </>
  );
}

export const JoystikStyled = styled.div`
  display: flex;
  position: absolute;
  bottom: 40px;
  margin-right: auto;
  margin-left: auto;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 100;
  & > div {
    background: rgba(189, 241, 243, 0.2) !important;
    border: 1px solid gray;
    & > button {
      background: rgba(53, 66, 152, 0.5) !important;
      border: 1px solid #ffffffce !important;
    }
  }
`;
