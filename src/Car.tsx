import React, {
  useEffect,
  RefObject,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";

import {
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
  Vector3Tuple,
} from "three";

import { GLTF } from "three-stdlib";
import { useControls as useLeva } from "leva";
import { useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
// import { useFrame } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import {
  CuboidCollider,
  RigidBody,
  useRapier,
  RapierRigidBody,
  RigidBodyProps,
  // Physics,
  // CylinderCollider,
  // useRevoluteJoint,§
  // useFixedJoint,
  // useBeforePhysicsStep,
} from "@react-three/rapier";
import {
  RapierRaycastVehicle,
  WheelOptions,
} from "./lib/rapier-raycast-vehicle";

import WheelURl from "../public/bmwe30wheel2.glb?url";

type WheelGLTF = GLTF & {
  nodes: {
    wheel_FR_bbs_tex002_0: Mesh;
    wheel_FR_blt002_0: Mesh;
    wheel_FR_disk002_0: Mesh;
    wheel_FR_disk_paint002_0: Mesh;
    wheel_FR_tire002_0: Mesh;
  };
  materials: {
    "disk.002": MeshStandardMaterial;
  };
};

type WheelProps = JSX.IntrinsicElements["group"] & {
  side: "left" | "right";
  radius: number;
  rotation: [number, number, number];
};

type RaycastVehicleWheel = {
  options: WheelOptions;
  object: RefObject<Object3D>;
};

export type VehicleProps = RigidBodyProps;

export type VehicleRef = {
  chassisRigidBody: RefObject<RapierRigidBody>;
  rapierRaycastVehicle: RefObject<RapierRaycastVehicle>;
  wheels: RaycastVehicleWheel[];
  setBraking: (braking: boolean) => void;
};

const Wheel = ({ side, rotation, radius, ...props }: WheelProps) => {
  const { nodes, materials } = useGLTF(WheelURl) as WheelGLTF;
  const scale = radius * 4;
  return (
    <group dispose={null} {...props}>
      <group scale={scale}>
        <group scale={side === "left" ? -1 : 1}>
          <mesh
            rotation={rotation}
            castShadow
            receiveShadow
            geometry={nodes.wheel_FR_bbs_tex002_0.geometry}
            material={materials["disk.002"]}
          />
          <mesh
            rotation={rotation}
            castShadow
            receiveShadow
            geometry={nodes.wheel_FR_blt002_0.geometry}
            material={materials["disk_brake.001"]}
          />
          <mesh
            rotation={rotation}
            castShadow
            receiveShadow
            geometry={nodes.wheel_FR_disk002_0.geometry}
            material={materials["disk_brake_tr.001"]}
          />
          <mesh
            rotation={rotation}
            castShadow
            receiveShadow
            geometry={nodes.wheel_FR_disk_paint002_0.geometry}
            material={materials["disk_paint.002"]}
          />
          <mesh
            rotation={rotation}
            castShadow
            receiveShadow
            geometry={nodes.wheel_FR_tire002_0.geometry}
            material={materials["tire.002"]}
          />
        </group>
      </group>
    </group>
  );
};

const Car = forwardRef<VehicleRef, VehicleProps>(function Car(
  { children },
  ref
) {
  const { perfVisible } = useLeva({
    perfVisible: false,
  });

  const rapier = useRapier();

  const vehicleRef = useRef<RapierRaycastVehicle>(null!);
  const chassisRigidBodyRef = useRef<RapierRigidBody>(null!);

  const topLeftWheelObject = useRef<Group>(null!);
  const topRightWheelObject = useRef<Group>(null!);
  const bottomLeftWheelObject = useRef<Group>(null!);
  const bottomRightWheelObject = useRef<Group>(null!);

  const bmwE30Chassis = useLoader(GLTFLoader, "./bmwe30withoutwheel.glb");

  const {
    indexRightAxis,
    indexForwardAxis,
    indexUpAxis,
    directionLocal: directionLocalArray,
    axleLocal: axleLocalArray,
    vehicleWidth,
    vehicleHeight,
    vehicleFront,
    vehicleBack,
    ...levaWheelOptions
  } = useLeva("wheel-options", {
    radius: 0.38,

    indexRightAxis: 2,
    indexForwardAxis: 0,
    indexUpAxis: 1,

    directionLocal: [0, -1.3, 0],
    axleLocal: [0, 0, 1],

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

    forwardAcceleration: 1,
    sideAcceleration: 3,

    vehicleWidth: 1.7,
    vehicleHeight: -0.35,
    vehicleFront: -1.35,
    vehicleBack: 1.45,
  });

  // const radius = 0.38
  // const indexRightAxis = 2
  // const indexForwardAxis = 0
  // const indexUpAxis = 1
  // const directionLocalArray = [0, -1, 0]
  // const axleLocalArray = [0, 0, 1]

  // const suspensionStiffness = 30
  // const suspensionRestLength = 0.3
  // const maxSuspensionForce = 100000
  // const maxSuspensionTravel = 0.3
  // const sideFrictionStiffness = 1
  // const frictionSlip = 1.4
  // const dampingRelaxation = 2.3
  // const dampingCompression = 4.4
  // const rollInfluence = 0.01
  // const customSlidingRotationalSpeed = -30
  // const useCustomSlidingRotationalSpeed = true
  // const forwardAcceleration = 1
  // const sideAcceleration = 1

  // const vehicleWidth = 1.7
  // const vehicleHeight = -0.3
  // const vehicleFront = -1.35
  // const vehicleBack = 1.3

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
      {perfVisible && <Perf position="top-left" />}

      {/* Chassis */}
      <RigidBody
        ref={chassisRigidBodyRef}
        // colliders="hull"
        colliders={false}
        // mass={100} // ??
        position={[0, 2, 0]}
        rotation={[-0.3, Math.PI, 0]}
      >
        <primitive
          position={[0, -0.89, 0]}
          rotation={[0, Math.PI / 2, 0]}
          object={bmwE30Chassis.scene}
          scale={0.7}
        />
        <CuboidCollider args={[2.3, 0.7, 1]} position={[0, 0, 0]} mass={50} />
        {children}
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

export default Car;
