import React, {
  useEffect,
  RefObject,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";

import { Group, Object3D, Vector3 } from "three";

import Wheel from "../../Wheel";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";

import {
  CuboidCollider,
  RigidBody,
  useRapier,
  RapierRigidBody,
} from "@react-three/rapier";
import {
  RapierRaycastVehicle,
  WheelOptions,
} from "../../../lib/rapier-raycast-vehicle";

type RaycastVehicleWheel = {
  options: WheelOptions;
  object: RefObject<Object3D>;
};

// TODO delete
export type VehicleModelProps = {
  resetVechicle: boolean;
};

export type VehicleRef = {
  chassisRigidBody: RefObject<RapierRigidBody>;
  rapierRaycastVehicle: RefObject<RapierRaycastVehicle>;
  wheels: RaycastVehicleWheel[];
  setBraking: (braking: boolean) => void;
};

const VehicleModel = forwardRef<VehicleRef, VehicleModelProps>(function VehicleModel(
  { resetVechicle },
  ref
) {
  const rapier = useRapier();

  const vehicleRef = useRef<RapierRaycastVehicle>(null!);
  const chassisRigidBodyRef = useRef<RapierRigidBody>(null!);

  const topLeftWheelObject = useRef<Group>(null!);
  const topRightWheelObject = useRef<Group>(null!);
  const bottomLeftWheelObject = useRef<Group>(null!);
  const bottomRightWheelObject = useRef<Group>(null!);

  // TODO add types
  const bmwE30Chassis = useLoader<any, any, any>(GLTFLoader, "./glb-models/bmwE30.glb");

  const indexRightAxis = 2;
  const indexForwardAxis = 0;
  const indexUpAxis = 1;
  const directionLocalArray = [0, -1.3, 0];
  const axleLocalArray = [0, 0, 1];
  const vehicleWidth = 1.7;
  const vehicleHeight = -0.35;
  const vehicleFront =-1.38;
  const vehicleBack = 1.45;

  const levaWheelOptions = {
    radius: 0.4,
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    sideFrictionStiffness: 1,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    rollInfluence: 0.01,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
    forwardAcceleration: 5,
    sideAcceleration: 3,
  }

  const directionLocal = useMemo(
    () => new Vector3(...directionLocalArray),
    [directionLocalArray]
  );
  const axleLocal = useMemo(
    () => new Vector3(...axleLocalArray),
    [axleLocalArray]
  );

  const commonWheelOptions = {
    ...levaWheelOptions,
    directionLocal,
    axleLocal,
  };

  const wheels = [
    {
      object: topLeftWheelObject,
      options: {
        ...commonWheelOptions,
        chassisConnectionPointLocal: new Vector3(
          vehicleBack,
          vehicleHeight,
          vehicleWidth * 0.5
        ),
      },
    },
    {
      object: topRightWheelObject,
      options: {
        ...commonWheelOptions,
        chassisConnectionPointLocal: new Vector3(
          vehicleBack,
          vehicleHeight,
          vehicleWidth * -0.5
        ),
      },
    },
    {
      object: bottomLeftWheelObject,
      options: {
        ...commonWheelOptions,
        chassisConnectionPointLocal: new Vector3(
          vehicleFront,
          vehicleHeight,
          vehicleWidth * 0.5
        ),
      },
    },
    {
      object: bottomRightWheelObject,
      options: {
        ...commonWheelOptions,
        chassisConnectionPointLocal: new Vector3(
          vehicleFront,
          vehicleHeight,
          vehicleWidth * -0.5
        ),
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    chassisRigidBody: chassisRigidBodyRef,
    rapierRaycastVehicle: vehicleRef,
    setBraking: () => {
      // TODO break?
      // const material = brakeLightsRef.current
      //     .material as MeshStandardMaterial
      // material.color = braking
      //     ? BRAKE_LIGHTS_ON_COLOR
      //     : BRAKE_LIGHTS_OFF_COLOR
    },
    wheels,
  }));

  useEffect(() => {
    vehicleRef.current = new RapierRaycastVehicle({
      world: rapier.world,
      chassisRigidBody: chassisRigidBodyRef.current,
      indexRightAxis,
      indexForwardAxis,
      indexUpAxis,
    });

    for (let i = 0; i < wheels.length; i++) {
      const options = wheels[i].options;
      vehicleRef.current.addWheel(options);
    }

    vehicleRef.current = vehicleRef.current;
  }, [
    chassisRigidBodyRef,
    vehicleRef,
    indexRightAxis,
    indexForwardAxis,
    indexUpAxis,
    directionLocal,
    axleLocal,
    levaWheelOptions,
  ]);


  return (
    <>
      {/* Chassis */}
      <RigidBody
        ref={chassisRigidBodyRef}
        colliders={false}
        position={[-80.9, 4, 0]}
        rotation={[0, 0.2, 0]}
      >
        <primitive
          position={[0, -0.89, 0]}
          rotation={[0, Math.PI / 2, 0]}
          object={bmwE30Chassis.scene}
          scale={0.7}
        />
        <CuboidCollider args={[2.39, 0.67, 1]} position={[-0.1, -0.09, 0]} mass={50} />
      </RigidBody>

      {/* Wheels */}
      <group ref={topLeftWheelObject}>
        <Wheel
          rotation={[0, -(Math.PI / 2), 0]}
          side="left"
          radius={commonWheelOptions.radius}
        />
      </group>
      <group ref={topRightWheelObject}>
        <Wheel
          rotation={[0, -(Math.PI / 2), 0]}
          side="right"
          radius={commonWheelOptions.radius}
        />
      </group>
      <group ref={bottomLeftWheelObject}>
        <Wheel
          rotation={[0, -(Math.PI / 2), 0]}
          side="left"
          radius={commonWheelOptions.radius}
        />
      </group>
      <group ref={bottomRightWheelObject}>
        <Wheel
          rotation={[0, -(Math.PI / 2), 0]}
          side="right"
          radius={commonWheelOptions.radius}
        />
      </group>
    </>
  );
});

export default VehicleModel;
