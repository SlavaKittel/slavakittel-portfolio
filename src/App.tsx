import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import styled, { keyframes } from "styled-components";
import { isMobile } from "react-device-detect";

import { Leva } from "leva";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { ScrollControls } from "@react-three/drei";

import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

import Vehicle from "./components/Vehicle/Vehicle";
import MainText from "./components/MainText";
import LinkedInLogo from "./components/LinkedInLogo";
import VideoBlock from "./components/VideoBlock";

export default function App() {
  const { perfVisible, debug } = useLeva({
    perfVisible: false,
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

  const [maxForceMobile, setMaxForceMobile] = useState<number | undefined>(0);
  const [steeringMobile, setSteeringMobile] = useState(0);
  const maxForce = 80;
  const maxSteer = 0.3;

  const moveHandler = (event: IJoystickUpdateEvent) => {
    if (!event.y || !event.x) return;
    const getMaxForceMobile = (y: number) => {
      if (y > 0 && y < 0.75) return 40
      return maxForce * y;
    }
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
      <ScrollDownIconStyled
        $currentScroll={currentScroll}
        $isVideoBlock={isVideoBlock}
      />
      <Canvas
        frameloop="demand"
        dpr={[1, 2]} // default pixelRatio //TODO need?
        camera={{
          fov: 35,
        }}
        shadows
        id="appCanvas"
      >
        {perfVisible && <Perf position="top-left" />}
        <ScrollControls pages={2} damping={0.005}> { /* TODO what the damping quantity? */}
          <Physics
            timeStep={1 / 400}
            updatePriority={-50}
            gravity={[0, -9.08, 0]}
            debug={debug}
          >
            {/* Lights */}
            <directionalLight castShadow position={[10, 4, 3]} intensity={3} />
            <ambientLight intensity={2.9} />

            {/* Main text */}
            <MainText />

            {/* Vehicle with Camera and Controls hooks */}
            <Vehicle
              isKeydown={isKeydown}
              maxForceMobile={maxForceMobile}
              steeringMobile={steeringMobile}
              setCurrentScroll={setCurrentScroll}
              isVideoBlock={isVideoBlock}
            />
            <LinkedInLogo position={[-68, -2.3, 0]} />
            <VideoBlock
              position={[-75, -1.9, 0]}
              onClick={() => setIsVideoBlock(!isVideoBlock)}
            />

            {/* Web-site boundary */}
            <RigidBody colliders="cuboid" type="fixed">
              <mesh receiveShadow position={[1, 0, 9]} rotation-x={0.1}>
                <boxGeometry args={[200, 3, 0.1]} />
                <meshStandardMaterial color="#ce0300" />
              </mesh>
              <mesh receiveShadow position={[1, 0, -9]} rotation-x={-0.1}>
                <boxGeometry args={[200, 3, 0.1]} />
                <meshStandardMaterial color="#ce0300" />
              </mesh>
            </RigidBody>

            {/* Ground */}
            <RigidBody
              type="fixed"
              colliders={false}
              friction={1}
              position={[0, -2, 0]}
              restitution={0.3}
            >
              <CuboidCollider args={[100, 0.5, 15]} />
              <mesh receiveShadow>
                <boxGeometry args={[200, 1, 18]} />
                <meshStandardMaterial color="#4e69b9" />
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
  bottom: 40px;
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
  0% {margin-top: 0}
  50% {margin-top: 20px}
  100% {margin-top: 0}
 `;
export const ScrollDownIconStyled = styled.div<{
  $currentScroll?: number;
  $isVideoBlock?: boolean;
}>`
  position: absolute;
  top: ${({ $currentScroll, $isVideoBlock }) =>
    ($currentScroll && $currentScroll > 0.1) || $isVideoBlock
      ? "calc(100vh)"
      : "calc(100vh - 60px)"};
  transition: top 0.5s ease-in-out;
  left: 50%;
  transform: translate(-50%, 0);
  width: 0;
  height: 30px;
  border: 2px solid;
  border-radius: 2px;
  z-index: 1;
  animation: ${jumpInfinite} 1.5s infinite;
  &:after {
    content: " ";
    position: absolute;
    top: 12px;
    left: -10px;
    width: 16px;
    height: 16px;
    border-bottom: 4px solid;
    border-right: 4px solid;
    border-radius: 4px;
    transform: rotateZ(45deg);
  }
`;
