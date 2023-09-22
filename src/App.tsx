import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, useBeforePhysicsStep } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { Vector3 } from "three";
import { ScrollControls, useScroll } from "@react-three/drei";

import Vehicle, { VehicleRef } from "./components/Vehicle";
import { Leva } from "leva";
import { useControls } from "./hooks/use-controls";

const cameraIdealOffset = new Vector3();
const cameraIdealLookAt = new Vector3();
const chassisTranslation = new Vector3();

type Props = {
  isKeydown: boolean;
};

const VehicleAndGroundWithBeforPhyscis = ({ isKeydown }: Props) => {
  const raycastVehicle = useRef<VehicleRef>(null);

  const controls = useControls();

  const camera = useThree((state) => state.camera);
  const currentCameraPosition = useRef(new Vector3(15, 15, 0));
  const currentCameraLookAt = useRef(new Vector3());

  const maxForce = 100;
  const maxBrake = 1;
  const maxSteer = 0.7;

  // start logic for smooth turning of the front wheels
  const stepSteer = 0.01;
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

  function GroundWebSite() {
    const scroll = useScroll();
    useFrame((state, delta) => {
      const chassis = raycastVehicle.current?.chassisRigidBody;
      if (!chassis?.current) return;

      const ratioScreen = window.innerHeight / window.innerWidth;
      const calculatedCoefficientScale = () => {
        if (ratioScreen > 0.5 && ratioScreen < 1)
          return Math.pow(ratioScreen, 3) * 4;
        if (ratioScreen > 1) return ratioScreen * 3;
        return Math.pow(ratioScreen, 3) * 10 - 1;
      };
      const calcCoefficientY = ratioScreen > 1 ? 9 : 3;

      chassisTranslation.copy(chassis.current.translation() as Vector3);

      const scrollPosition = scroll.offset * 2 * 100 - 100;
      const scrollOrVehiclePosition = isKeydown
        ? chassisTranslation.x
        : scrollPosition;

      const scrollOrVehiclePositionZ = isKeydown
        ? 0.3 * chassisTranslation.z
        : 0;

      const t = 1 - Math.pow(0.01, delta);

      cameraIdealOffset.set(35, 20, 0);
      cameraIdealOffset.addScaledVector(
        new THREE.Vector3(10, calcCoefficientY, 0),
        calculatedCoefficientScale()
      );
      cameraIdealOffset.add(new THREE.Vector3(scrollOrVehiclePosition, 0, 0));

      cameraIdealLookAt.set(22, 6, 0);
      cameraIdealLookAt.add(
        new THREE.Vector3(scrollOrVehiclePosition, 0, scrollOrVehiclePositionZ)
      );

      currentCameraPosition.current.lerp(cameraIdealOffset, t);
      currentCameraLookAt.current.lerp(cameraIdealLookAt, t);

      camera.position.copy(currentCameraPosition.current);
      camera.lookAt(currentCameraLookAt.current);
    });

    // let scrollTopValue = document.getElementById("scroll-controls")!.scrollTop / window.innerHeight
    // useFrame((state, delta) => {
    //   const chassisPositionTranslation =
    //   raycastVehicle.current?.chassisRigidBody?.current?.translation();
    //   co/     chassisPosition * window.innerHeight;
    //   // }

    //   const scrollOrVehiclePosition =
    //     isKeydown && chassisPosition > scrollPosition
    //       ? chassisPosition
    //       : scrollPosition;

    //   state.camera.position.set(scrollOrVehiclePosition * 190, 60, 0);

    //   // console.log("isKeydown", isKeydown);
    //   // console.log("isMouseWheel", isMouseWheel);
    //   // // console.log("scrollPosition>", scrollPosition > chassisPosition);
    //   // // console.log("chassisPosition>", scrollPosition < chassisPosition);
    //   // console.log(
    //   //   "=",
    //   //   scrollPosition.toFixed(2) === chassisPosition.toFixed(2)
    //   // );
    //   // console.log("scrollPosition", scrollPosition.toFixed(2));
    //   // console.log("chassisPosition", chassisPosition.toFixed(2));
    //   // // console.log("newScrollPosition", newScrollPosition.toFixed(3));
    // });nst chassisPosition = (chassisPositionTranslation!.x + 100) / 100 / 2;

    //   let scrollPosition =
    //     document.getElementById("scroll-controls")!.scrollTop /
    //     window.innerHeight;

    //   if (isKeydown && scrollTopValue > chassisPosition) {
    //     scrollTopValue -= 0.006
    //     scrollPosition = scrollTopValue;
    //     // newScrollPosition -= 0.006;
    //   }

    //   // if (isKeydown && chassisPosition > scrollPosition) {
    //   //   document.getElementById("scroll-controls")!.scrollTop =
    //   /
    return (
      <RigidBody type="fixed" restitution={1} friction={0.3}>
        <mesh receiveShadow position={[0, -1.77, 0]}>
          <boxGeometry args={[200, 0.5, 30]} />
          <meshStandardMaterial color="#4e69b9" />
        </mesh>
      </RigidBody>
    );
  }

  return (
    <>
      <Vehicle ref={raycastVehicle} />

      {/* ground */}
      <GroundWebSite />
    </>
  );
};

export default function App() {
  const [isKeydown, setKeydown] = useState(false);

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

  const { perfVisible } = useLeva({
    perfVisible: false,
  });
  return (
    <>
      <Leva collapsed />
      {perfVisible && <Perf position="top-left" />}
      <Canvas
        frameloop="demand"
        dpr={[1, 2]} // default pixelRatio
        // orthographic
        camera={{
          // position: [400, 300, -200],
          fov: 35,
          // zoom: 1,
        }}
        // camera={{
        //   position: [90, 60, 0],
        //   fov: 35,
        //   zoom: 0.1,
        // }}
        // camera={{
        //   position: [190, 60, 0],
        //   fov: 5,
        //   zoom: 20,
        // }}
        shadows
      >
        <ScrollControls pages={2}>
          <Physics timeStep="vary">
            {/* Camera */}
            {/* <OrthographicCamera
            makeDefault
            zoom={20}
            top={200}
            bottom={-200}
            left={200}
            right={-200}
            near={1}
            far={2000}
            position={[190, 50, 0]}
          /> */}
            {/* <FlyControls makeDefault /> */}

            {/* Lights */}
            <directionalLight castShadow position={[10, 4, 3]} intensity={3} />
            <ambientLight intensity={2.9} />

            <VehicleAndGroundWithBeforPhyscis isKeydown={isKeydown} />

            {/* web-site boundary */}
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
          </Physics>
        </ScrollControls>
        {/* <gridHelper args={[80, 50]} position-y={-0.74} /> */}
      </Canvas>
    </>
  );
}
