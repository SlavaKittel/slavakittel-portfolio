import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ConsoleView, isMobile } from "react-device-detect";

import { useControls } from "../../hooks/use-controls";

import { useBeforePhysicsStep } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { Vector3 } from "three";
import { useScroll, OrbitControls } from "@react-three/drei";

import VehicleModel, { VehicleRef } from "./components/VihecleModel";

type VehicleProps = {
  isKeydown: boolean;
  maxForceMobile: number;
  angleOfJoystick: number;
  setCurrentScroll: (currentScroll: number) => void;
  isVideoBlock: number;
  setToggleSliderOne: (toggleSliderOne: boolean) => void;
  setToggleSliderTwo: (toggleSliderTwo: boolean) => void;
  setIsCubesFlying: (isCubesFlying: boolean) => void;
  isCubesFalled: boolean;
  isVehicleBack: boolean;
};

export default function Vehicle({
  isKeydown,
  maxForceMobile,
  angleOfJoystick,
  setCurrentScroll,
  isVideoBlock,
  setToggleSliderOne,
  setToggleSliderTwo,
  setIsCubesFlying,
  isCubesFalled,
}: VehicleProps) {
  const { cameraMode } = useLeva("camera", {
    cameraMode: {
      value: "drive",
      options: ["drive", "orbit"],
    },
  });
  const [brakeMobile, setBrakeMobile] = useState(false);
  const [resetVechicle, setResetVehicle] = useState(true);
  const controls = useControls();
  const scroll = useScroll();

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

  const getAngle = (y: number, x: number) => {
    const angleOf180 = (Math.atan2(y, x) * 180) / Math.PI;
    const angleOf360 = angleOf180 < 0 ? angleOf180 + 360 : angleOf180;
    return angleOf360;
  };

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
    } = raycastVehicle.current;

    // update wheels from controls
    let engineForce = 0;
    let steering = 0;

    const angleOfVehicle = getAngle(
      -raycastVehicle.current?.rapierRaycastVehicle.current
        .updateWheelRotation_fwd.x,
      -raycastVehicle.current?.rapierRaycastVehicle.current
        .updateWheelRotation_fwd.z
    );

    const calcSteeringMobile = () => {
      if (angleOfJoystick === 0) return 0;
      if (angleOfJoystick - 180 > angleOfVehicle)
        return ((angleOfJoystick - 360 - angleOfVehicle) / 360) * 2;
      if (angleOfVehicle - 180 > angleOfJoystick)
        return ((angleOfJoystick + 360 - angleOfVehicle) / 360) * 2;
      return ((angleOfJoystick - angleOfVehicle) / 360) * 2;
    };

    const limitedCalcSteeringMobile = () => {
      if (calcSteeringMobile() > 0.7) return 0.7;
      if (calcSteeringMobile() < -0.7) return -0.7;
      return calcSteeringMobile();
    };

    const engineForceMobile = () => {
      if (
        (maxForceMobile === 0 &&
          vehicle.state.currentVehicleSpeedKmHour < -1) ||
        (!controls.current.backward &&
          maxForceMobile === 0 &&
          vehicle.state.currentVehicleSpeedKmHour > 1)
      ) {
        setBrakeMobile(true);
        return 0;
      }
      setBrakeMobile(false);
      return maxForceMobile * 0.75;
    };

    if (isMobile) {
      engineForce += engineForceMobile();
      steering += limitedCalcSteeringMobile();
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

    const brakeForce = controls.current.brake || brakeMobile ? maxBrake : 0;

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
  });

  useFrame((state, delta) => {
    if (cameraMode !== "drive") return;

    const chassis = raycastVehicle.current?.chassisRigidBody;
    if (!chassis?.current) return;

    // chassis translation
    newChassisTranslation.copy(chassis.current.translation() as Vector3);

    // set for reset vehicle
    if (newChassisTranslation.y < -8)
      setResetVehicle(false), setTimeout(() => setResetVehicle(true), 100);

    // toggle slider-video when vehicle on sliders
    if (
      isKeydown &&
      newChassisTranslation.x > -63 &&
      newChassisTranslation.x < -46.5
    )
      setToggleSliderOne(true);
    if (
      isKeydown &&
      (newChassisTranslation.x < -63 || newChassisTranslation.x > -46.5)
    )
      setToggleSliderOne(false);

    if (
      isKeydown &&
      newChassisTranslation.x > -45 &&
      newChassisTranslation.x < -28.3
    )
      setToggleSliderTwo(true);
    if (
      isKeydown &&
      (newChassisTranslation.x < -45 || newChassisTranslation.x > -28.3)
    )
      setToggleSliderTwo(false);

    // is cubes fall
    const positionX = 0; // var from funZone

    if (
      newChassisTranslation.x > positionX + 4.8 &&
      newChassisTranslation.x < positionX + 5.8 &&
      newChassisTranslation.z > -0.5 &&
      newChassisTranslation.z < 0.5
    )
      setIsCubesFlying(true);
    if (
      !isCubesFalled &&
      (newChassisTranslation.x < positionX + 4.8 ||
        newChassisTranslation.x > positionX + 5.8 ||
        newChassisTranslation.z < -0.5 ||
        newChassisTranslation.z > 0.5)
    )
      setIsCubesFlying(false);

    const speedAnimation = 1.0 - Math.pow(0.005, delta);
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
    const scrollPosition = () => {
      const getScrollPosition = () => {
        if (ratioScreen > 1) return 40;
        return 40 * ratioScreen
      };
      if (isVideoBlock === 1) return -65;
      if (isVideoBlock === 2) return -47;
      return scroll.offset * 2 * 54 - 88 - (getScrollPosition());
    };


    // axises calculation
    const videoBlockX = isVideoBlock ? 0.01 : 20;
    const videoBlockY = isVideoBlock ? calcVideoBlockByRatioY() : 40;
    const ratioScreenY = ratioScreen > 1 ? 9 : 3;
    const scrollOrVehiclePositionX =
      isKeydown && !isVideoBlock ? newChassisTranslation.x : scrollPosition();
    const scrollOrVehiclePositionZ =
      isKeydown && !isVideoBlock ? 1 * newChassisTranslation.z : 0;

    // set current scroll
    setCurrentScroll(scroll.range(0, 0));

    // newCameraPosition
    newCameraPosition.set(videoBlockX, videoBlockY, 0);
    newCameraPosition.addScaledVector(
      new THREE.Vector3(10, ratioScreenY, 0),
      calculatedCoefficientScale()
    );
    newCameraPosition.add(new THREE.Vector3(scrollOrVehiclePositionX, 0, scrollOrVehiclePositionZ));

    // newCameraLookAt
    if (!isKeydown && !isVideoBlock) {
      newCameraLookAt.copy(currentCameraPosition.current);
      newCameraLookAt.y -= 1000; 
    } else {
      newCameraLookAt.copy(currentCameraPosition.current);
      newCameraLookAt.set(10, 10, 0);
      newCameraLookAt.add(
        new THREE.Vector3(scrollOrVehiclePositionX, 0, scrollOrVehiclePositionZ)
      );
    }

    // smooth animation
    currentCameraPosition.current.lerp(newCameraPosition, speedAnimation);
    currentCameraLookAt.current.lerp(newCameraLookAt, speedAnimation);

    // set camera
    state.camera.position.copy(currentCameraPosition.current);
    state.camera.up.set(-1, 0, 0); 
    state.camera.lookAt(currentCameraLookAt.current);
  });

  return (
    <>
      {cameraMode === "orbit" && <OrbitControls />}
      {resetVechicle && (
        <VehicleModel ref={raycastVehicle} resetVechicle={resetVechicle} />
      )}
    </>
  );
}
