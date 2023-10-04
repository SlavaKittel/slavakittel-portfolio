import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import { Leva } from "leva";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { ScrollControls } from "@react-three/drei";

import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

import CameraAndControlVehicle from "./components/CameraAndControlVehicle/CameraAndControlVehicle";
import MainText from "./components/MainText";

export default function App() {
  const { perfVisible, debug } = useLeva({
    perfVisible: false,
    debug: false,
  });
  const [isKeydown, setKeydown] = useState(true);

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

  const [maxForceMobile, setMaxForceMobile] = useState(0);
  const [steeringMobile, setSteeringMobile] = useState(0);
  const maxForce = 100;
  const maxSteer = 0.3;

  const moveHandler = (event: IJoystickUpdateEvent) => {
    if (!event.y || !event.x) return;
    setMaxForceMobile(maxForce * event?.y);
    setSteeringMobile(maxSteer * -event?.x);
    setKeydown(true);
  };

  const moveHandlerStop = () => {
    setMaxForceMobile(0);
    setSteeringMobile(0);
  };

  return (
    <>
      <Leva collapsed />
      {isMobile && (
        <JoystikStyled>
          <Joystick size={100} move={moveHandler} stop={moveHandlerStop} />
        </JoystikStyled>
      )}
      <Canvas
        frameloop="demand" // TODO ?
        dpr={[1, 2]} // default pixelRatio //TODO need?
        camera={{
          fov: 35,
        }}
        shadows
        id="appCanvas"
      >
        {perfVisible && <Perf position="top-left" />}
        <ScrollControls pages={2}>
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
            <CameraAndControlVehicle
              isKeydown={isKeydown}
              maxForceMobile={maxForceMobile}
              steeringMobile={steeringMobile}
            />

            {/* Web-site boundary */}
            <RigidBody colliders="cuboid" type="fixed">
              <mesh receiveShadow position={[1, 0, 15]} rotation-x={0.1}>
                <boxGeometry args={[200, 3, 1]} />
                <meshStandardMaterial color="#ce0300" />
              </mesh>
              <mesh receiveShadow position={[1, 0, -15]} rotation-x={-0.1}>
                <boxGeometry args={[200, 3, 1]} />
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
                <boxGeometry args={[200, 1, 30]} />
                <meshStandardMaterial color="#4e69b9" />
              </mesh>
            </RigidBody>
          </Physics>
        </ScrollControls>
      </Canvas>
    </>
  );
}

export const JoystikStyled = styled.div`
  display: flex;
  position: absolute;
  bottom: 40px;
  margin-right: auto;
  margin-left: auto;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 100;
  & > div {
    background: rgba(189, 241, 243, 0.2) !important;
    border: 1px solid gray;
    & > button {
      background: rgba(53, 66, 152, 0.5) !important;
      border: 1px solid #ffffffce !important;
    }
  }
`;
