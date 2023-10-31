import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import styled, { keyframes } from "styled-components";
import { isMobile } from "react-device-detect";
import { EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

import { Leva } from "leva";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { ScrollControls, Text, MeshReflectorMaterial } from "@react-three/drei";

import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

import Vehicle from "./components/Vehicle/Vehicle";
import MainText from "./components/MainText";
import LinkedInLogo from "./components/LinkedInLogo";
import VideoBlock from "./components/VideoBlock";

export default function App() {
  const directionalLigthRef = useRef<any>(); // TODO only for dev

  const { perfVisible, debug } = useLeva({
    perfVisible: true,
    debug: false,
  });
  const [isKeydown, setKeydown] = useState(true);
  const [currentScroll, setCurrentScroll] = useState(0);
  const [isVideoBlock, setIsVideoBlock] = useState(false);

  useEffect(() => {
    const clickListener = (e: { code: string; preventDefault: () => void }) => {
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
          e.code
        ) > -1
      ) {
        setKeydown(true);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", clickListener);

    return () => document.removeEventListener("keydown", clickListener);
  }, []);

  useEffect(() => {
    const appCanvas = document.getElementById("appCanvas");
    const clickListener = () => setKeydown(false);
    document.addEventListener("wheel", clickListener);
    appCanvas?.addEventListener("touchmove", clickListener);

    return () => {
      document.removeEventListener("wheel", clickListener);
      appCanvas?.removeEventListener("touchmove", clickListener);
    };
  }, []);

  const [maxForceMobile, setMaxForceMobile] = useState<number>(0);
  const [steeringMobile, setSteeringMobile] = useState(0);
  // TODO naming??
  const maxForce = 100;
  const maxSteer = 0.5;

  const moveHandler = (event: IJoystickUpdateEvent) => {
    if (!event.y || !event.x) return;
    const getMaxForceMobile = (y: number) => {
      if (y > 0 && y < 0.75) return 90;
      return maxForce * y;
    };
    setMaxForceMobile(getMaxForceMobile(event?.y));
    setSteeringMobile(maxSteer * -event?.x);
    setKeydown(true);
  };

  const moveHandlerStop = () => {
    setMaxForceMobile(0);
    setSteeringMobile(0);
  };

  return (
    <AppStyled $isVideoBlock={isVideoBlock}>
      <Leva collapsed />
      {isMobile && (
        <JoystikStyled>
          <Joystick size={100} move={moveHandler} stop={moveHandlerStop} />
        </JoystikStyled>
      )}
      <ScrollDownWrapperStyled
        $currentScroll={currentScroll}
        $isVideoBlock={isVideoBlock}
      >
        <div className="text">Scroll Down</div>
      </ScrollDownWrapperStyled>

      <Canvas
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
        }} // TODO need to apply true srgb color
        frameloop="demand"
        dpr={[1, 2]} // default pixelRatio //TODO need?
        camera={{
          fov: 35,
        }}
        id="appCanvas"
        linear // TODO need to apply true srgb color
        legacy // TODO need to apply true srgb color
      >
        {perfVisible && <Perf position="top-left" />}
        <color args={["#5c5a5a"]} attach="background" />
        {/* TODO calculate Depth and check performance */}
        <EffectComposer disableNormalPass>
          {/* <DepthOfField
            focusDistance={0.025} // where to focus
            focalLength={0.08} // focal length
            bokehScale={6} // bokeh size
          /> */}
        </EffectComposer>

        <Text
          color="#bababa"
          fontSize={1.3}
          font="/fonts/Barlow_Condensed/BarlowCondensed-SemiBold.ttf"
          position={[-74, 0, 0]}
          rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
          maxWidth={17}
          lineHeight={1.0}
          textAlign="center"
        >
          I'm Slava, and my mission is to lead the way in 3D web user
          interaction. Now, you can buy my products and services to transform
          your digital presence. Together, we'll shape the future of web
          interaction for your success.
        </Text>
        <Text
          color="#bababa"
          fontSize={1}
          font="/fonts/Barlow_Condensed/BarlowCondensed-SemiBold.ttf"
          position={[-63, 0, 0]}
          rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
          maxWidth={17}
          lineHeight={1.0}
          textAlign="center"
        >
          Good examples, what we expect by 3d web user interaction
        </Text>

        <ScrollControls pages={2} damping={0.005}>
          <Physics
            timeStep={1 / 400}
            updatePriority={-50}
            gravity={[0, -9.08, 0]}
            debug={debug}
          >
            {/* Lights */}
            <pointLight
              ref={directionalLigthRef}
              position={[-90, 10, 10]}
              intensity={1.2}
              shadow-mapSize={[5024, 5024]}
            />
            <ambientLight intensity={1.7} />

            {/* Main text */}
            <MainText />

            {/* Vehicle with Camera and Controls hooks */}
            <Vehicle
              isKeydown={isKeydown}
              maxForceMobile={maxForceMobile}
              steeringMobile={steeringMobile}
              setCurrentScroll={setCurrentScroll}
              isVideoBlock={isVideoBlock}
              directionalLigthRef={directionalLigthRef}
            />

            <LinkedInLogo position={[-45, -0.5, 0]} />
            <VideoBlock
              position={[-55, 0, 0]}
              onClick={() => setIsVideoBlock(!isVideoBlock)}
            />

            {/* Web-site boundary */}
            <RigidBody colliders="cuboid" type="fixed">
              <mesh position={[1, 0, 9]} rotation-x={0.1}>
                <boxGeometry args={[200, 3, 0.1]} />
                <meshStandardMaterial color="#1d4446" />
              </mesh>
              <mesh position={[1, 0, -9]} rotation-x={-0.1}>
                <boxGeometry args={[200, 3, 0.1]} />
                <meshStandardMaterial color="#1d4446" />
              </mesh>
            </RigidBody>

            {/* Ground */}
            <RigidBody
              type="fixed"
              colliders={false}
              friction={1}
              position={[0, -0.51, 0]}
              restitution={0.3}
            >
              <CuboidCollider args={[100, 0.5, 9]} />
              <mesh rotation-x={-Math.PI / 2} position={[0, 0.5, 0]}>
                <planeGeometry args={[200, 18]} />
                <MeshReflectorMaterial
                  blur={[900, 900]}
                  resolution={600}
                  mixBlur={1}
                  mixStrength={50}
                  roughness={0.8}
                  depthScale={0.4}
                  minDepthThreshold={1.5}
                  maxDepthThreshold={1.4}
                  color="#050708"
                  metalness={0.9}
                  mirror={0}
                />
              </mesh>
            </RigidBody>
          </Physics>
        </ScrollControls>
      </Canvas>
    </AppStyled>
  );
}

export const AppStyled = styled.div<{ $isVideoBlock: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  & > div > div > div {
    overflow: ${({ $isVideoBlock }) =>
      $isVideoBlock ? "hidden !important;" : "unset"};
  }
`;

export const JoystikStyled = styled.div`
  display: flex;
  position: absolute;
  bottom: 60px;
  margin-right: auto;
  margin-left: auto;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 1;
  & > div {
    background: rgba(189, 241, 243, 0.2) !important;
    border: 1px solid gray;
    & > button {
      background: rgba(53, 66, 152, 0.5) !important;
      border: 1px solid #ffffffce !important;
    }
  }
`;

const jumpInfinite = keyframes`
  0% { transform: skewX(-15deg); }
  2% { transform: skewX(15deg); }
  4% { transform: skewX(-15deg); }
  6% { transform: skewX(15deg); }
  8% { transform: skewX(0deg); }
  100% { transform: skewX(0deg); }  
 `;
export const ScrollDownWrapperStyled = styled.div<{
  $currentScroll?: number;
  $isVideoBlock?: boolean;
}>`
  position: absolute;
  top: ${({ $currentScroll, $isVideoBlock }) =>
    ($currentScroll && $currentScroll > 0.1) || $isVideoBlock
      ? "calc(100%)"
      : "calc(100% - 50px)"};
  transition: top 0.5s ease-in-out;
  left: 50%;
  font-family: Barlow;
  font-size: 18px;
  color: white;
  transform: translate(-50%, 0);
  z-index: 1;
  .text {
    animation: ${jumpInfinite} 2.5s infinite;
  }
`;
