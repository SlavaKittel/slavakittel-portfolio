import { useMemo } from "react";
import { RigidBody, InstancedRigidBodyProps } from "@react-three/rapier";
import { isMobile } from "react-device-detect";

type FunZoneProps = {};

const FunZone = ({}: FunZoneProps) => {
  const count = isMobile ? 25 : 100;

  const cubes = useMemo(() => {
    const newCubes: InstancedRigidBodyProps[] = [];
    for (let i = 0; i < count; i += 1) {
      newCubes.push({
        key: "instance_" + Math.random(),
        position: [
          Math.random() * 10 + 20,
          Math.random() * 70 + 210,
          (0.5 - Math.random()) * 4,
        ],
        rotation: [Math.random(), Math.random(), Math.random()],
      });
    }
    return newCubes;
  }, []);

  return cubes.map((cube) => (
    <RigidBody colliders="cuboid" friction={1} mass={200} key={cube.key}>
      <mesh position={cube.position} rotation={cube.rotation}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e40f0f" roughness={0.1} metalness={0.6} />
      </mesh>
    </RigidBody>
  ));
};

export default FunZone;
