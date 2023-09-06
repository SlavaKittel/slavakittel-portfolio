import React, { useRef } from "react";
import "./style.css";
import { Canvas } from "@react-three/fiber";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, useBeforePhysicsStep } from "@react-three/rapier";
import { useControls as useLeva } from "leva";

import Vehicle, { VehicleRef } from "./components/Vehicle";
import { Leva } from "leva";
import { useControls } from "./hooks/use-controls";
import { OrbitControls } from "@react-three/drei";

const VehicleWithBeforPhyscis = () => {
  const raycastVehicle = useRef<VehicleRef>(null);
  const controls = useControls();

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
    setBraking(brakeForce > 0);
  });

  return <Vehicle ref={raycastVehicle} />;
};

export default function App() {
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
        camera={{
          position: [10, 5, 2],
          fov: 35,
          zoom: 1,
        }}
        shadows
      >
        <Physics debug timeStep="vary">
          {/* Camera */}
          <OrbitControls makeDefault />

          {/* Lights */}
          <directionalLight castShadow position={[10, 4, 3]} intensity={20} />
          <ambientLight intensity={5.9} />

          <VehicleWithBeforPhyscis />

          {/* */}

          {/* ground */}
          <RigidBody type="fixed" restitution={1} friction={0.3}>
            <mesh receiveShadow position-y={-1}>
              <boxGeometry args={[200, 0.5, 200]} />
              <meshStandardMaterial color="#f0f0f0" />
              {/* <MeshReflectorMaterial
                      resolution={ 1018 }
                      blur={ [1000, 1000] }
                      mixBlur={1}
                      mirror={ 0 }
                      color="grey"
                      /> */}
            </mesh>
          </RigidBody>
          <gridHelper args={[50, 50]} position-y={-0.74} />
        </Physics>
      </Canvas>
    </>
  );
}
