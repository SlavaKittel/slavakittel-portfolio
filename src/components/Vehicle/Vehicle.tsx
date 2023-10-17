import * as THREE from "three";
import React, { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { isMobile } from "react-device-detect";

import { useControls } from "../../hooks/use-controls";

import { useBeforePhysicsStep } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { Vector3 } from "three";
import { useScroll, OrbitControls } from "@react-three/drei";

import VehicleModel, { VehicleRef } from "./components/VihecleModel";

type VehicleProps = {
  isKeydown: boolean;
  maxForceMobile: number;
  steeringMobile: number;
  setCurrentScroll: (currentScroll: number) => void;
  isVideoBlock: boolean;
};

export default function Vehicle({
  isKeydown,
  maxForceMobile,
  steeringMobile,
  setCurrentScroll,
  isVideoBlock,
}: VehicleProps) {
  const { cameraMode } = useLeva("camera", {
    cameraMode: {
      value: "drive",
      options: ["drive", "orbit"],
    },
  });
  const controls = useControls();
  const scroll = useScroll();
  const camera = useThree((state) => state.camera);

  const raycastVehicle = useRef<VehicleRef>(null);
  const currentCameraPosition = useRef(new Vector3());
  const currentCameraLookAt = useRef(new Vector3());

  const newCameraPosition = new Vector3();
  const newCameraLookAt = new Vector3();
  const newChassisTranslation = new Vector3();

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

    // chassis translation
    newChassisTranslation.copy(chassis.current.translation() as Vector3);

    const { offset, scroll: scrollCurrent } = scroll as any;
    const speedAnimation = 1.0 - Math.pow(0.01, delta);
    // const speedAnimation = 50 * delta;
    // const speedAnimation = 0.045;
    const ratioScreen = window.innerHeight / window.innerWidth;
    const calculatedCoefficientScale = () => {
      if (isVideoBlock) return 1;
      if (ratioScreen > 0.5 && ratioScreen < 1)
        return Math.pow(ratioScreen, 3) * 2;
      if (ratioScreen > 1 && ratioScreen < 2) return ratioScreen * 1.3;
      if (ratioScreen > 2) return ratioScreen * 1.2;
      return Math.pow(ratioScreen, 3);
    };
    const calcVideoBlockByRatioY = () => {
      if (ratioScreen > 1 && ratioScreen < 2) return 24 * ratioScreen;
      return 27 * ratioScreen;
    };
    const scrollPosition = isVideoBlock ? -85 : offset * 2 * 100 - 100;

    // axises calculation
    const videoBlockX = isVideoBlock ? 0.01 : 20;
    const videoBlockY = isVideoBlock ? calcVideoBlockByRatioY() : 20;
    const ratioScreenY = ratioScreen > 1 ? 9 : 3;
    const scrollOrVehiclePositionX =
      isKeydown && !isVideoBlock ? newChassisTranslation.x : scrollPosition;
    const scrollOrVehiclePositionZ =
      isKeydown && !isVideoBlock ? 0.3 * newChassisTranslation.z : 0;

    // set current scroll
    setCurrentScroll(scrollCurrent.current);

    // newCameraPosition
    newCameraPosition.set(videoBlockX, videoBlockY, 0);
    newCameraPosition.addScaledVector(
      new THREE.Vector3(10, ratioScreenY, 0),
      calculatedCoefficientScale()
    );
    newCameraPosition.add(new THREE.Vector3(scrollOrVehiclePositionX, 0, 0));

    // newCameraLookAt
    newCameraLookAt.set(10, 10, 0);
    newCameraLookAt.add(
      new THREE.Vector3(scrollOrVehiclePositionX, 0, scrollOrVehiclePositionZ)
    );

    // smooth animation
    currentCameraPosition.current.lerp(newCameraPosition, speedAnimation);
    currentCameraLookAt.current.lerp(newCameraLookAt, speedAnimation);

    // set camera
    camera.position.copy(currentCameraPosition.current);
    camera.lookAt(currentCameraLookAt.current);
  });

  return (
    <>
      {cameraMode === "orbit" && <OrbitControls />}
      <VehicleModel ref={raycastVehicle} />
    </>
  );
}
