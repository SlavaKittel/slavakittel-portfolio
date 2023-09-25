import React, { useState, useRef } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { Text3D } from "@react-three/drei";

type TextProps = {};

const MainText = ({}: TextProps) => {
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
    "C",
    "r",
    "e",
    "a",
    "t",
    "i",
    "v",
    "e",
    "P",
    "o",
    "r",
    "t",
    "f",
    "o",
    "l",
    "i",
    "o",
  ];

  const mainTextName = lettersArrayName.map((letter, index) => {
    const positionLetterByZ = () => {
      if (index > 4 && index < 7) return -(index * 1.4 - 4);
      if (index >= 7) return -(index * 1.4 - 4.5);
      return -(index * 1.3 - 9.5);
    };
    const [isAsleep, setIsAsleep] = useState(false);
    const rigidBody = useRef<RapierRigidBody>(null);
    return (
      <RigidBody
        ref={rigidBody}
        colliders="hull"
        position={[-85, 5.74, positionLetterByZ()]}
        onSleep={() => setIsAsleep(true)}
        onWake={() => setIsAsleep(false)}
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
          <meshStandardMaterial color={isAsleep ? "green" : "blue"} />
        </Text3D>
      </RigidBody>
    );
  });
  const mainTextPortfolio = lettersArrayPortfolio.map((letter, index) => {
    const positionLetterByZ = () => {
      if (index >= 8) return -(index * 0.7 - 4.5);
      return -(index * 0.7 - 9.5);
    };
    const [isAsleep, setIsAsleep] = useState(false);
    const rigidBody = useRef<RapierRigidBody>(null);
    return (
      <RigidBody
        ref={rigidBody}
        colliders="cuboid"
        position={[-82, 5.74, positionLetterByZ()]}
        onSleep={() => setIsAsleep(true)}
        onWake={() => setIsAsleep(false)}
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
          <meshStandardMaterial color={isAsleep ? "green" : "blue"} />
        </Text3D>
      </RigidBody>
    );
  });
  return (
    <>
      {mainTextName}
      {mainTextPortfolio}
    </>
  );
};

export default MainText;
