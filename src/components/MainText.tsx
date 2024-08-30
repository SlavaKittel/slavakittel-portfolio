import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { Text3D, useMatcapTexture } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";

type TextProps = {};

const MainText = ({}: TextProps) => {
  const lettersArrayMyName = [
    "S",
    "L",
    "A",
    "V",
    "A",
    "K",
    "I",
    "T",
    "T",
    "E",
    "L",
  ];
  const lettersArrayBeCreaive = ["be", "creative"];
  const lettersArrayFunZone = ["fun", "zone"];

  const mainTextMyName = lettersArrayMyName.map((letter, index) => {
    const positionLetterByZ = () => {
      if (index > 4 && index < 7) return -(index * 1.4 - 6);
      if (index >= 7) return -(index * 1.4 - 6.5);
      return -(index * 1.3 - 7.5);
    };
    const nameTexture = (type: string) =>
      `./texture/DiamondPlate008B/DiamondPlate008B_1K-JPG_${type}.jpg`;
    const [colorMap, displacementMap, normalMap, roughnessMap, aoMap] =
      useLoader(TextureLoader as any, [
        nameTexture("Color"),
        nameTexture("Displacement"),
        nameTexture("NormalGL"),
        nameTexture("Roughness"),
        nameTexture("AmbientOcclusion"),
      ]);

    const repeatTextures = (texture: {
      wrapS: number;
      wrapT: number;
      repeat: { x: number; y: number };
    }) => {
      const repeat = 0.2;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.x = repeat;
      texture.repeat.y = repeat;
    };

    repeatTextures(colorMap);
    repeatTextures(displacementMap);
    repeatTextures(normalMap);
    repeatTextures(roughnessMap);
    repeatTextures(aoMap);

    return (
      <RigidBody
        colliders="hull"
        position={[-85, 5.74, positionLetterByZ()]}
        rotation-y={Math.PI * 0.5}
        key={`${index}-${letter}`}
        friction={1}
      >
        <Text3D
          font="./fonts/Fjalla One_Regular.json"
          size={2}
          height={1.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0}
          bevelSegments={5}
        >
          {letter}
          <meshStandardMaterial
            displacementScale={0}
            displacementBias={0}
            map={colorMap}
            displacementMap={displacementMap}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
            aoMap={aoMap}
            metalness={0.6}
            roughness={0.5}
          />
        </Text3D>
      </RigidBody>
    );
  });
  
  const mainTextPortfolio = lettersArrayBeCreaive.map((letter, index) => {
    const positionLetterByZ = index === 1 ? -5 : -3;
    return (
      <RigidBody
        colliders="cuboid"
        position={[-82, 5.74, positionLetterByZ]}
        rotation-z={Math.PI * 0.5}
        rotation-x={Math.PI * 1.5}
        key={`${index}-${letter}`}
        friction={1}
      >
        <Text3D
          font="./fonts/Fjalla One_Regular.json"
          size={1}
          height={0.4}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0}
          bevelSegments={5}
        >
          {letter}
          <meshStandardMaterial color="#50e7d7" roughness={0.5} metalness={0.6} />
        </Text3D>
      </RigidBody>
    );
  });

  const funZoneText = lettersArrayFunZone.map((letter, index) => {
    const positionLetterByZ = index === 1 ? 0 : 2.5;
    return (
      <RigidBody
        colliders="cuboid"
        position={[-8, 5.74, positionLetterByZ]}
        rotation-z={Math.PI * 0.5}
        rotation-x={Math.PI * 1.5}
        key={`${index}-${letter}`}
        friction={1}
      >
        <Text3D
          font="./fonts/Fjalla One_Regular.json"
          size={1}
          height={0.4}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0}
          bevelSegments={5}
        >
          {letter}
          <meshStandardMaterial color="#50e7d7" roughness={0.5} metalness={0.6} />
        </Text3D>
      </RigidBody>
    );
  });

  return (
    <>
      {mainTextMyName}
      {mainTextPortfolio}
      {funZoneText}
    </>
  );
};

export default MainText;
