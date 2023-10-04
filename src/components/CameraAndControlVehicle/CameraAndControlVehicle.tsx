import * as THREE from "three";
import React, { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { isMobile } from "react-device-detect";

import { useControls } from "../../hooks/use-controls";

import { useBeforePhysicsStep } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { Vector3 } from "three";
import { useScroll, OrbitControls } from "@react-three/drei";

import Vehicle, { VehicleRef } from "./components/Vehicle";

type VehicleHooksProps = {
  isKeydown: boolean;
  maxForceMobile: number;
  steeringMobile: number;
};

export default function CameraAndControlVehicle({
  isKeydown,
  maxForceMobile,
  steeringMobile,
}: VehicleHooksProps) {
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
}
