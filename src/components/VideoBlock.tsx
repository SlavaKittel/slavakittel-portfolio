import React, { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  useVideoTexture,
  RenderTexture,
  PerspectiveCamera,
  Clone,
} from "@react-three/drei";
import { MathUtils, Group } from "three";

type VideoBlockProps = {
  position: [number, number, number];
  onClick: () => void;
};

const VideoBlock = ({ position, onClick }: VideoBlockProps) => {
  const maxNumberOfSliders = 4
  const [numberOfSlider, setNumberOfSlider] = useState(0);
  const videoRef = useRef<any>(); // TODO fix type
  const arrowLeftRef = useRef<any>(); // TODO fix type
  const arrowRightRef = useRef<Group>();
  const arrowModel = useLoader(GLTFLoader, "./../glb-models/arrow-logo.glb");

  const [hoveredRight, setHoverRight] = useState(false);
  const [mouseDownRight, setMouseDownRight] = useState(false);
  const [hoveredLeft, setHoverLeft] = useState(false);
  const [mouseDownLeft, setMouseDownLeft] = useState(false);

  // TODO will do component Button or redesign
  useFrame(() => {
    const positionY = () => {
      if (mouseDownRight)
        return MathUtils.lerp(
          arrowRightRef.current!.position.y,
          position[1] - 0.2,
          0.1
        );
      if (hoveredRight)
        return MathUtils.lerp(
          arrowRightRef.current!.position.y,
          position[1] + 0.2,
          0.1
        );
      return MathUtils.lerp(arrowRightRef.current!.position.y, position[1] - 0.2, 0.1);
    };
    arrowRightRef.current!.position.y = positionY();
  });

  // TODO will do component Button or redesign
  useFrame(() => {
    const positionY = () => {
      if (mouseDownLeft)
        return MathUtils.lerp(
          arrowLeftRef.current!.position.y,
          position[1] - 0.2,
          0.1
        );
      if (hoveredLeft)
        return MathUtils.lerp(
          arrowLeftRef.current!.position.y,
          position[1] + 0.2,
          0.1
        );
      return MathUtils.lerp(arrowLeftRef.current!.position.y, position[1] - 0.2, 0.1);
    };
    arrowLeftRef.current!.position.y = positionY();
  });

  // TODO will imporve code
  useFrame((state) => {
    const positionX = () => {
      if (numberOfSlider === 0)
        return MathUtils.lerp(videoRef.current!.position.x, 0, 0.08);
      if (numberOfSlider === 1)
        return MathUtils.lerp(videoRef.current!.position.x, -21, 0.08);
      if (numberOfSlider === 2)
        return MathUtils.lerp(videoRef.current!.position.x, -42, 0.08);
      if (numberOfSlider === 3)
        return MathUtils.lerp(videoRef.current!.position.x, -63, 0.08);
    };
    videoRef.current!.position.x = positionX();
  });

  const getNewNumberOfSlider = (
    e: { stopPropagation: any },
    side: string,
    maxNumber: number
  ) => {
    if (side === "left" && numberOfSlider > 0) {
      return setNumberOfSlider(numberOfSlider - 1), e.stopPropagation();
    }
    if (side === "right" && maxNumber - 2 >= numberOfSlider) {
      return setNumberOfSlider(numberOfSlider + 1), e.stopPropagation();
    }
    return e.stopPropagation();
  };

  return (
    <>
      <RigidBody type="fixed" colliders="hull">
        <primitive
          ref={arrowRightRef}
          scale={0.6}
          position={[-56.3, null, -7.8]}
          object={arrowModel.scene}
          onClick={(e: { stopPropagation: () => any }) =>
            getNewNumberOfSlider(e, "right", maxNumberOfSliders)
          }
          onPointerDown={() => setMouseDownRight(true)}
          onPointerUp={() => setMouseDownRight(false)}
          onPointerOver={() => setHoverRight(true)}
          onPointerOut={() => setHoverRight(false)}
          onPointerEnter={() => (document.body.style.cursor = "pointer")}
          onPointerLeave={() => (document.body.style.cursor = "default")}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="hull">
        <Clone
          ref={arrowLeftRef}
          scale={0.6}
          rotation-y={Math.PI}
          position={[-54.3, 0, 7.8]}
          object={arrowModel.scene}
          onClick={(e: { stopPropagation: () => any }) =>
            getNewNumberOfSlider(e, "left", maxNumberOfSliders)
          }
          onPointerDown={() => setMouseDownLeft(true)}
          onPointerUp={() => setMouseDownLeft(false)}
          onPointerOver={() => setHoverLeft(true)}
          onPointerOut={() => setHoverLeft(false)}
          onPointerEnter={() => (document.body.style.cursor = "pointer")}
          onPointerLeave={() => (document.body.style.cursor = "default")}
        />
      </RigidBody>
      {/* TODO Performance!!!!! */}
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={position}
        receiveShadow
        onClick={onClick}
        onPointerEnter={() => (document.body.style.cursor = "pointer")}
        onPointerLeave={() => (document.body.style.cursor = "default")}
      >
        <planeGeometry args={[18, 13.5, 1]} />
        <meshStandardMaterial>
          <RenderTexture attach="map" anisotropy={36} sourceFile={undefined}>
            <PerspectiveCamera
              makeDefault
              manual
              aspect={1 / 1}
              position={[0, 0, 22]}
            />
            <mesh ref={videoRef}>
              <mesh position-x={0}>
                <planeGeometry args={[20, 20, 1]} />
                <meshBasicMaterial
                  map={useVideoTexture("video/comp3.mp4")}
                  toneMapped={false}
                />
              </mesh>
              <mesh position-x={21}>
                <planeGeometry args={[20, 20, 1]} />
                <meshBasicMaterial
                  map={useVideoTexture("video/comp3.mp4")}
                  toneMapped={false}
                />
              </mesh>
              <mesh position-x={42}>
                <planeGeometry args={[20, 20, 1]} />
                <meshBasicMaterial
                  map={useVideoTexture("video/comp3.mp4")}
                  toneMapped={false}
                />
              </mesh>
              <mesh position-x={63}>
                <planeGeometry args={[20, 20, 1]} />
                <meshBasicMaterial
                  map={useVideoTexture("video/comp3.mp4")}
                  toneMapped={false}
                />
              </mesh>
            </mesh>
          </RenderTexture>
        </meshStandardMaterial>
      </mesh>
    </>
  );
};

export default VideoBlock;
