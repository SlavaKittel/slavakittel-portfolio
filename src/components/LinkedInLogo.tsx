import React, { useState, useRef, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader, useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { MathUtils, Vector3 } from "three";

type LinkedInProps = {
  position: [number, number, number];
};

export type LinkedInRef = {
  scale: Vector3;
  position: Vector3;
};

const LinkedInLogo = ({ position }: LinkedInProps) => {
  const linkedInRef = useRef<LinkedInRef>();
  const linkedInModel = useLoader(GLTFLoader, "./glb-models/linkedin-logo.glb");
  const [hovered, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  // TODO will do component Button or redesign
  useFrame(() => {
    const positionY = () => {
      if (mouseDown)
        return MathUtils.lerp(
          linkedInRef.current!.position.y,
          position[1] - 0.2,
          0.1
        );
      if (hovered)
        return MathUtils.lerp(
          linkedInRef.current!.position.y,
          position[1] + 0.4,
          0.1
        );
      return MathUtils.lerp(linkedInRef.current!.position.y, position[1], 0.1);
    };
    linkedInRef.current!.position.y = positionY();
  });

  return (
    <RigidBody type="fixed" colliders="hull">
      <primitive
        ref={linkedInRef}
        position={position}
        object={linkedInModel.scene}
        onClick={(e: { stopPropagation: () => any }) => (
          (window.location.href = "https://www.linkedin.com/in/slavakittel/"),
          e.stopPropagation()
        )}
        onPointerDown={() => setMouseDown(true)}
        onPointerUp={() => setMouseDown(false)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onPointerEnter={() => (document.body.style.cursor = "pointer")}
        onPointerLeave={() => (document.body.style.cursor = "default")}
      />
    </RigidBody>
  );
};

export default LinkedInLogo;
