import { useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader, useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { MathUtils, Vector3 } from "three";

type SocialNetworkLogoProps = {
  position: [number, number, number];
  link: string;
  model: string;
};

export type LogoRef = {
  position: Vector3;
};

const SocialNetworkLogo = ({
  position,
  link,
  model,
}: SocialNetworkLogoProps) => {
  const logoRef = useRef<LogoRef>();
  const logoModel = useLoader(GLTFLoader, model);
  const [hovered, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  useFrame(() => {
    const positionY = () => {
      if (mouseDown)
        return MathUtils.lerp(
          logoRef.current!.position.y,
          position[1] - 0.2,
          0.1
        );
      if (hovered)
        return MathUtils.lerp(
          logoRef.current!.position.y,
          position[1] + 0.4,
          0.1
        );
      return MathUtils.lerp(logoRef.current!.position.y, position[1], 0.1);
    };
    logoRef.current!.position.y = positionY();
  });

  return (
    <>
      <RigidBody colliders="hull" friction={1}>
        <primitive
          ref={logoRef}
          rotation={[0, 0, 0]}
          position={position}
          object={logoModel.scene}
          onClick={(e: { stopPropagation: () => any }) => (
            (window.location.href = link), e.stopPropagation()
          )}
          onPointerDown={() => setMouseDown(true)}
          onPointerUp={() => setMouseDown(false)}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onPointerEnter={() => (document.body.style.cursor = "pointer")}
          onPointerLeave={() => (document.body.style.cursor = "default")}
        />
      </RigidBody>
    </>
  );
};

export default SocialNetworkLogo;
