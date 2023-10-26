import React, { useState, useRef } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { Text3D, useMatcapTexture } from "@react-three/drei";

type TextProps = {};

const MainText = ({}: TextProps) => {
  const [matcapTexture] = useMatcapTexture("245642_3D8168_3D6858_417364", 256);
  const lettersArrayName = [
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
  const lettersArrayPortfolio = [
    "be",
    "creative",
  ];

  const mainTextMyName = lettersArrayName.map((letter, index) => {
    const positionLetterByZ = () => {
      if (index > 4 && index < 7) return -(index * 1.4 - 6);
      if (index >= 7) return -(index * 1.4 - 6.5);
      return -(index * 1.3 - 7.5);
    };
    const rigidBody = useRef<RapierRigidBody>(null);
    return (
      <RigidBody
        ref={rigidBody}
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
          <meshMatcapMaterial matcap={matcapTexture} />
        </Text3D>
      </RigidBody>
    );
  });
  const mainTextPortfolio = lettersArrayPortfolio.map((letter, index) => {
    const positionLetterByZ = index === 1 ? -5 : -3;
    const rigidBody = useRef<RapierRigidBody>(null);
    return (
      <RigidBody
        ref={rigidBody}
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
          <meshStandardMaterial color='black' />
        </Text3D>
      </RigidBody>
    );
  });
  return (
    <>
      {mainTextMyName}
      {mainTextPortfolio}
    </>
  );
};

export default MainText;
