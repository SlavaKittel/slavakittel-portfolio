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
  const linkedIn = useLoader(GLTFLoader, "./linkedin-logo.glb");
  const [hovered, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  useFrame(() => {
    linkedInRef.current!.scale.x = hovered
      ? MathUtils.lerp(linkedInRef.current!.scale.x, 1.2, 0.05)
      : MathUtils.lerp(linkedInRef.current!.scale.x, 1, 0.05);
    linkedInRef.current!.scale.y = hovered
      ? MathUtils.lerp(linkedInRef.current!.scale.y, 1.2, 0.05)
      : MathUtils.lerp(linkedInRef.current!.scale.y, 1, 0.05);
    linkedInRef.current!.scale.z = hovered
      ? MathUtils.lerp(linkedInRef.current!.scale.z, 1.2, 0.05)
      : MathUtils.lerp(linkedInRef.current!.scale.z, 1, 0.05);

    linkedInRef.current!.position.y = mouseDown
      ? MathUtils.lerp(linkedInRef.current!.position.y, -2.5, 0.1)
      : MathUtils.lerp(linkedInRef.current!.position.y, -2.3, 0.1);
  });

  return (
    <RigidBody type="fixed" colliders="hull">
      <primitive
        ref={linkedInRef}
        position={position}
        object={linkedIn.scene}
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
