import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

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

import Vehicle, { VehicleRef } from "./components/Vehicle";
import MainText from "./components/MainText";

const cameraIdealOffset = new Vector3();
const cameraIdealLookAt = new Vector3();
const chassisTranslation = new Vector3();

type Props = {
  isKeydown: boolean;
};

const VehicleHooks = ({ isKeydown }: Props) => {
  const { cameraMode } = useLeva("camera", {
    cameraMode: {
      value: "drive",
      options: ["drive", "orbit"],
    },
  });

  const controls = useControls();
  const scroll = useScroll();

  const raycastVehicle = useRef<VehicleRef>(null);

  const camera = useThree((state) => state.camera);
  const currentCameraPosition = useRef(new Vector3(15, 15, 0));
  const currentCameraLookAt = useRef(new Vector3());

  const maxForce = 100;
  const maxBrake = 0.3;
  const maxSteer = 0.7;

  // start logic for smooth turning of the front wheels
  const stepSteer = 0.002;
  let steer = 0;
  function steerIncreaseLeft() {
    setTimeout(function () {
      if (steer < maxSteer && controls.current.left) {
        steer += stepSteer;
      }
    }, 70);
  }
  function steerDicreaseLeft() {
    setTimeout(function () {
      if (steer > stepSteer && !controls.current.left) {
        steer -= stepSteer;
      }
    }, 70);
  }
  function steerIncreaseRight() {
    setTimeout(function () {
      if (steer > -maxSteer && controls.current.right) {
        steer -= stepSteer;
      }
    }, 70);
  }
  function steerDicreaseRight() {
    setTimeout(function () {
      if (steer < -stepSteer && !controls.current.right) {
        steer += stepSteer;
      }
    }, 70);
  }
  // end logic for smooth turning of the front wheels

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

    if (controls.current.forward) {
      engineForce += maxForce;
    }
    if (controls.current.backward) {
      engineForce -= maxForce;
    }

    if (controls.current.left) {
      steerIncreaseLeft();
      steering = steer;
    }
    if (!controls.current.left) {
      steerDicreaseLeft();
      steering = steer;
    }
    if (controls.current.right) {
      steerIncreaseRight();
      steering = steer;
    }
    if (!controls.current.right) {
      steerDicreaseRight();
      steering = steer;
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
    debug: true,
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
    const clickListener = () => setKeydown(false);
    document.addEventListener("wheel", clickListener);

    return () => document.removeEventListener("wheel", clickListener);
  }, []);

  return (
    <>
      <Leva collapsed />
      <Canvas
        frameloop="demand" // TODO ?
        dpr={[1, 2]} // default pixelRatio //TODO need?
        camera={{
          fov: 35,
        }}
        shadows
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

            {/* Vehicle with hooks */}
            <VehicleHooks isKeydown={isKeydown} />

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
