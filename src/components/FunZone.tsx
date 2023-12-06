import { useMemo, useRef } from "react";
import { RigidBody, InstancedRigidBodyProps } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { isMobile } from "react-device-detect";
import { Text } from "@react-three/drei";
import { Geometry, Base, Subtraction } from "@react-three/csg";

type FunZoneProps = {
  isCubesFlying: boolean;
  setIsCubesFalled: (isCubesFalled: boolean) => void;
  positionX: number;
};

const FunZone = ({
  isCubesFlying,
  setIsCubesFalled,
  positionX,
}: FunZoneProps) => {
  const count = isMobile ? 70 : 100;

  const cubes = useMemo(() => {
    const newCubes: InstancedRigidBodyProps[] = [];
    for (let i = 0; i < count; i += 1) {
      newCubes.push({
        key: "instance_" + Math.random(),
        position: [
          Math.random() * 10 + positionX,
          Math.random() * 70 + 210,
          (0.5 - Math.random()) * 4,
        ],
        rotation: [Math.random(), Math.random(), Math.random()],
      });
    }
    return newCubes;
  }, []);

  const cubesBlock = cubes.map((cube) => (
    <RigidBody colliders="cuboid" friction={1} mass={200} key={cube.key}>
      <mesh position={cube.position} rotation={cube.rotation}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e40f0f" roughness={0.1} metalness={0.6} />
      </mesh>
    </RigidBody>
  ));

  const mainMarkingsRef = useRef<any>();
  const horizontalMarkingsRef = useRef<any>();
  const stepMark = 0.15;
  const stepHorizontalMark = 4.2;

  useFrame((state, delta) => {
    if (mainMarkingsRef.current.scale.x >= 1) setIsCubesFalled(true);
    if (isCubesFlying && mainMarkingsRef.current.scale.x < 1) {
      mainMarkingsRef.current.scale.x += delta * stepMark;
      mainMarkingsRef.current.position.x -= delta * stepMark * 3;
    }
    if (isCubesFlying && horizontalMarkingsRef.current.scale.x < 1) {
      horizontalMarkingsRef.current.scale.x += delta * stepHorizontalMark;
      horizontalMarkingsRef.current.position.x -=
        delta * stepHorizontalMark * 0.11;
    }
    if (!isCubesFlying) {
      mainMarkingsRef.current.scale.x = 0;
      mainMarkingsRef.current.position.x = 0;
      horizontalMarkingsRef.current.scale.x = 0;
      horizontalMarkingsRef.current.position.x = 0;
    }
  });

  return (
    <>
      {/* Parking Markings */}
      <mesh position={[positionX + 8, 0, 0]}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          ref={mainMarkingsRef}
          scale={[0, 1, 1]}
        >
          <Geometry>
            <Base>
              <planeGeometry args={[6, 3.62]} />
            </Base>
            <mesh position={[0, 0, 0.4]}>
              <Subtraction>
                <boxGeometry args={[7, 3.18, 2]} />
              </Subtraction>
            </mesh>
          </Geometry>
          <meshStandardMaterial color="#cee750" />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[0, 1, 1]}
          ref={horizontalMarkingsRef}
        >
          <planeGeometry args={[0.22, 3.18]} />
          <meshStandardMaterial color="#cee750" />
        </mesh>
        <mesh
          position={[-3, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 1, 1]}
        >
          <Geometry>
            <Base>
              <planeGeometry args={[6.1, 3.72]} />
            </Base>
            <Subtraction position={[-0.27, 0, 0.4]}>
              <boxGeometry args={[6, 3.08, 2]} />
            </Subtraction>
            <Subtraction position={[0, 1.7, 0.4]}>
              <boxGeometry args={[6, 0.22, 2]} />
            </Subtraction>
            <Subtraction position={[0, -1.7, 0.4]}>
              <boxGeometry args={[6, 0.22, 2]} />
            </Subtraction>
            <Subtraction position={[2.89, 0, 0.4]}>
              <boxGeometry args={[0.22, 3.62, 2]} />
            </Subtraction>
          </Geometry>
          <meshStandardMaterial color={isCubesFlying ? "#cee750" : "#7a892d"} />
        </mesh>
      </mesh>

      <Text
        color={isCubesFlying ? "#50e7d7" : "#5eb0a8"}
        fontSize={1}
        font="/fonts/Barlow_Condensed/BarlowCondensed-SemiBold.ttf"
        position={[positionX, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.0}
        textAlign="center"
      >
        Park the car and wait here
      </Text>

      {isCubesFlying && cubesBlock}
    </>
  );
};

export default FunZone;
