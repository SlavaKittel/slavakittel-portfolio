import React, { useState } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

type VideoBlockProps = {
  position: [number, number, number];
  onClick: () => void;
};

const VideoBlock = ({ position, onClick }: VideoBlockProps) => {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      friction={1}
      position={position}
      restitution={0.3}
    >
      <CuboidCollider args={[10 / 2, 1 / 2, 18 / 2]} />
      <mesh
        receiveShadow
        onClick={onClick}
        onPointerEnter={() => (document.body.style.cursor = "pointer")}
        onPointerLeave={() => (document.body.style.cursor = "default")}
      >
        <boxGeometry args={[10, 1, 18]} />
        <meshStandardMaterial color="#55d91c" />
      </mesh>
    </RigidBody>
  );
};

export default VideoBlock;
