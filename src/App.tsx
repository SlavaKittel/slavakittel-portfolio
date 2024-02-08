import { useState, useEffect, Suspense, useCallback } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import styled, { keyframes } from "styled-components";
import { isMobile } from "react-device-detect";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

import { Leva } from "leva";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import {
  ScrollControls,
  MeshReflectorMaterial,
  Stars,
} from "@react-three/drei";

import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

import Vehicle from "./components/Vehicle/Vehicle";
import MainText from "./components/MainText";
import InfoText from "./components/InfoText";
import FunZone from "./components/FunZone";
import SocialNetworkLogo from "./components/SocialNetworkLogo";
import VideoSliderShaderBlock from "./components/VideoSliderShaderBlock";
import Lights from "./components/Lights";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const { perfVisible, debug } = useLeva({
    perfVisible: true,
    debug: false,
  });
  const [isKeydown, setKeydown] = useState(true);
  const [isVehicleBack, setVehicleBack] = useState(false);
  const [isJoystikStart, setJoystikStart] = useState(false);

  const [currentScroll, setCurrentScroll] = useState(0);
  const [isVideoBlock, setIsVideoBlock] = useState(0);

  const [toggleSliderOne, setToggleSliderOne] = useState(false);
  const [toggleSliderTwo, setToggleSliderTwo] = useState(false);

  const [isCubesFalled, setIsCubesFalled] = useState(false);
  const [isCubesFlying, setIsCubesFlying] = useState(false);

  // Scroll and key controll listener
  useEffect(() => {
    const clickListener = (e: { code: string; preventDefault: () => void }) => {
      if (
        [
          "Space",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      ) {
        e.preventDefault();
        setKeydown(true);
      }
    };
    document.addEventListener("keydown", clickListener);

    return () => document.removeEventListener("keydown", clickListener);
  }, []);

  const moveBackStartHandler = (e: any) => {
    setKeydown(true);
    setVehicleBack(true);
    setMaxForceMobile(-100);
  };
  const moveBackEndHandler = (e: any) => {
    setVehicleBack(false);
    if (isJoystikStart) return setMaxForceMobile(100);
    setMaxForceMobile(0);
  };

  useEffect(() => {
    const appCanvas = document.getElementById("appCanvas");
    const keydownHandler = () => {
      setKeydown(false);
    };
    const joystikStartHandler = () => {
      setJoystikStart(true);
      !isVehicleBack && setMaxForceMobile(100);
    };
    const joystikEndHandler = () => {
      setJoystikStart(false);
      !isVehicleBack && setMaxForceMobile(0);
    };

    document.addEventListener("wheel", keydownHandler);
    appCanvas?.addEventListener("touchstart", keydownHandler);

    document
      .querySelector('div[data-testid="joystick-base"]')
      ?.addEventListener("touchstart", joystikStartHandler);
    document
      .querySelector('div[data-testid="joystick-base"]')
      ?.addEventListener("touchend", joystikEndHandler);
    return () => {
      document.removeEventListener("wheel", keydownHandler);
      appCanvas?.removeEventListener("touchstart", keydownHandler);

      document
        .querySelector('div[data-testid="joystick-base"]')
        ?.removeEventListener("touchstart", joystikStartHandler);
      document
        .querySelector('div[data-testid="joystick-base"]')
        ?.removeEventListener("touchend", joystikEndHandler);
    };
  }, [isVehicleBack]);

  // Vehicle mobile control: Joystick
  const [maxForceMobile, setMaxForceMobile] = useState<number>(0);
  const [angleOfJoystick, setAngleOfJoystick] = useState(0);

  const moveHandler = useCallback((event: IJoystickUpdateEvent) => {
    if (!event.y || !event.x || !event.distance) return;

    const getAngle = (y: number, x: number) => {
      const angleOf180 = (Math.atan2(y, x) * 180) / Math.PI;
      const angleOf360 = angleOf180 < 0 ? angleOf180 + 360 : angleOf180;
      return angleOf360;
    };
    const angleOfJoystickValue = getAngle(event.y, event.x);

    setAngleOfJoystick(angleOfJoystickValue);
    setKeydown(true);
  }, []);

  const moveHandlerStop = () => {
    setAngleOfJoystick(0);
  };

  const joystickSize = () => {
    if (window.innerHeight < 800) return 80;
    return 100;
  };

  //Ground Texture
  const [groundRoughness, groundNormal, groundAoMap] = useLoader(
    TextureLoader,
    [
      "./texture/MetalBronzeWorn001/MetalBronzeWorn001_ROUGHNESS_1K_METALNESS.jpg",
      "./texture/MetalBronzeWorn001/MetalBronzeWorn001_NRM_1K_METALNESS.jpg",
      "./texture/MetalBronzeWorn001/MetalBronzeWorn001_DISP16_1K_METALNESS.jpg",
    ]
  );
  const repeatGorundTextures = (texture: {
    wrapS: number;
    wrapT: number;
    repeat: { x: number; y: number };
  }) => {
    const repeat = 10;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = repeat;
    texture.repeat.y = repeat * 0.1;
  };
  repeatGorundTextures(groundRoughness);
  repeatGorundTextures(groundNormal);
  repeatGorundTextures(groundAoMap);

  // Boundary Texture
  const nameBoundaryTexture = (type: string) =>
    `./texture/BricksLongThinRunningExtruded001/BricksLongThinRunningExtruded001_${type}_1K_METALNESS.jpg`;
  const [
    boundaryColorMap,
    boundaryDisplacementMap,
    boundaryNormalMap,
    boundaryRoughnessMap,
    boundaryAoMap,
  ] = useLoader(TextureLoader, [
    nameBoundaryTexture("COL"),
    nameBoundaryTexture("DISP"),
    nameBoundaryTexture("NRM"),
    nameBoundaryTexture("ROUGHNESS"),
    nameBoundaryTexture("AO"),
  ]);

  const repeatBoundaryTextures = (texture: {
    wrapS: number;
    wrapT: number;
    repeat: { x: number; y: number };
  }) => {
    const repeat = 0.4;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = repeat * 20;
    texture.repeat.y = repeat * 1;
  };

  repeatBoundaryTextures(boundaryColorMap);
  repeatBoundaryTextures(boundaryDisplacementMap);
  repeatBoundaryTextures(boundaryNormalMap);
  repeatBoundaryTextures(boundaryRoughnessMap);
  repeatBoundaryTextures(boundaryAoMap);

  return (
    <>
      <Suspense fallback={null}>
        {
          <AppStyled $isVideoBlock={isVideoBlock}>
            <Leva collapsed />
            {isMobile && (
              <ControlStyled $joystikSmall={joystickSize() === 80}>
                <div className="joystik-block">
                  <Joystick
                    size={joystickSize()}
                    move={moveHandler}
                    stop={moveHandlerStop}
                  />
                </div>
                <div
                  tabIndex={0}
                  id="move-back"
                  className="move-back-block"
                  onTouchStart={moveBackStartHandler}
                  onTouchEnd={moveBackEndHandler}
                  onTouchCancel={moveBackEndHandler}
                >
                  <div className="revers-back-button">R</div>
                </div>
              </ControlStyled>
            )}
            <ScrollDownWrapperStyled
              $currentScroll={currentScroll}
              $isVideoBlock={isVideoBlock}
              $isMobile={isMobile}
            >
              <div className="text">Scroll Down</div>
            </ScrollDownWrapperStyled>
            <Canvas
              gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.NoToneMapping;
              }}
              dpr={[1, 2]} // default pixelRatio //TODO need?
              camera={{
                fov: 35,
              }}
              id="appCanvas"
              linear
              legacy
            >
              <Stars
                radius={2}
                depth={7}
                count={300}
                factor={2.5}
                saturation={500}
                fade
                speed={0.2}
              />
              {perfVisible && <Perf position="top-left" />}
              <color args={["#153030"]} attach="background" />
              <InfoText />
              {/* Lights */}
              <Lights />
              {/* Video Examples */}
              <VideoSliderShaderBlock
                position={[-55, 0.01, 0]}
                video1="video/skate1200x900.mp4"
                video2="video/furniture1200x900.mp4"
                toggleSlider={toggleSliderOne}
                setToggleSlider={setToggleSliderOne}
                onClick={() => {
                  if (!!isVideoBlock) return setIsVideoBlock(0);
                  return setIsVideoBlock(1);
                }}
                isKeydown={isKeydown}
              />
              <VideoSliderShaderBlock
                position={[-37, 0.01, 0]}
                video1="video/top-view1200x90.mp4"
                video2="video/scooter1200x900.mp4"
                toggleSlider={toggleSliderTwo}
                setToggleSlider={setToggleSliderTwo}
                onClick={() => {
                  if (!!isVideoBlock) return setIsVideoBlock(0);
                  return setIsVideoBlock(2);
                }}
                isKeydown={isKeydown}
              />
              <Physics
                timeStep={1 / 400}
                updatePriority={-50}
                gravity={[0, -9.08, 0]}
                debug={debug}
                maxStabilizationIterations={8}
              >
                {/* Main text */}
                <MainText />
                {/* Social links */}
                <SocialNetworkLogo
                  position={[-18, 1.4, 2.5]}
                  link="https://www.linkedin.com/in/slavakittel/"
                  model="./glb-models/linkedin-logo.glb"
                />
                <SocialNetworkLogo
                  position={[-18, 1.4, -2.5]}
                  link="https://github.com/SlavaKittel"
                  model="./glb-models/github-logo.glb"
                />
                {/* Fun Zone and Test Performance */}
                <FunZone
                  positionX={0}
                  isCubesFlying={isCubesFlying}
                  setIsCubesFalled={setIsCubesFalled}
                />
                {/* Main camera with scroll and Vehicle */}
                <ScrollControls pages={2} damping={0.005}>
                  {/* Vehicle with Camera and Controls hooks */}
                  <Vehicle
                    isKeydown={isKeydown}
                    maxForceMobile={maxForceMobile}
                    angleOfJoystick={angleOfJoystick}
                    isVideoBlock={isVideoBlock}
                    setCurrentScroll={setCurrentScroll}
                    setToggleSliderOne={setToggleSliderOne}
                    setToggleSliderTwo={setToggleSliderTwo}
                    setIsCubesFlying={setIsCubesFlying}
                    isCubesFalled={isCubesFalled}
                    isCubesFlying={isCubesFlying}
                    isVehicleBack={isVehicleBack}
                  />
                </ScrollControls>
                {/* Web-site boundary */}
                <RigidBody colliders={false} type="fixed">
                  <mesh position={[-38, 1.45, 9.3]} rotation-x={0.1}>
                    <CuboidCollider
                      args={[122 / 2, 3 / 2, 0.3 / 2]}
                      position={[0, 0, 0]}
                    />
                    <boxGeometry args={[122, 3, 0.3]} />
                    <meshStandardMaterial
                      displacementScale={0}
                      displacementBias={0}
                      map={boundaryColorMap}
                      displacementMap={boundaryDisplacementMap}
                      normalMap={boundaryNormalMap}
                      roughnessMap={boundaryRoughnessMap}
                      aoMap={boundaryAoMap}
                      metalness={0.65}
                      roughness={0.5}
                    />
                  </mesh>
                  <mesh position={[-38, 1.45, -9.3]} rotation-x={-0.1}>
                    <CuboidCollider
                      args={[122 / 2, 3 / 2, 0.3 / 2]}
                      position={[0, 0, 0]}
                    />
                    <boxGeometry args={[122, 3, 0.3]} />
                    <meshStandardMaterial
                      displacementScale={0}
                      displacementBias={0}
                      map={boundaryColorMap}
                      displacementMap={boundaryDisplacementMap}
                      normalMap={boundaryNormalMap}
                      roughnessMap={boundaryRoughnessMap}
                      aoMap={boundaryAoMap}
                      metalness={0.65}
                      roughness={0.5}
                    />
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
                  <CuboidCollider args={[61, 0.5, 9]} position={[-38, 0, 0]} />
                  <mesh rotation-x={-Math.PI / 2} position={[-38, 0.5, 0]}>
                    <planeGeometry args={[122, 18]} />
                    <MeshReflectorMaterial
                      envMapIntensity={0}
                      normalMap={groundNormal}
                      roughnessMap={groundRoughness}
                      aoMap={groundAoMap}
                      dithering={true}
                      color={[0.021, 0.025, 0.028]}
                      roughness={0.9}
                      metalness={0.1}
                      blur={[2000, 2000]}
                      mixBlur={30}
                      mixStrength={80}
                      mixContrast={1}
                      resolution={isMobile ? 80 : 250}
                      mirror={0}
                      depthScale={0.01}
                      minDepthThreshold={0.8}
                      maxDepthThreshold={1}
                      depthToBlurRatioBias={0.2}
                    />
                  </mesh>
                </RigidBody>
              </Physics>
            </Canvas>
          </AppStyled>
        }
      </Suspense>
      <LoadingScreen />
    </>
  );
}

export const AppStyled = styled.div<{ $isVideoBlock: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  touch-action: none;

  /* blocked zoom out and zoom in on iOS, 
  we did it inside ScrollControls to block touchmove on axis x */
  #appCanvas {
    & > div > div {
      & > div {
        touch-action: pan-y;
      }
    }
  }
  /* blocked scrollng when we click on VideoBlock */
  & > div > div > div {
    overflow: ${({ $isVideoBlock }) =>
      !!$isVideoBlock ? "hidden !important;" : "unset"};
  }
`;

export const ControlStyled = styled.div<{ $joystikSmall: boolean }>`
  .joystik-block {
    display: flex;
    position: absolute;
    bottom: ${({ $joystikSmall }) => ($joystikSmall ? "70px" : "60px")};
    right: 80px;
    z-index: 1;
    & > div {
      background: transparent !important;
      border: 2px solid #ffffff75;
      & > button {
        background: url("/img/joystick-logo.jpg") no-repeat center !important;
        background-size: 180% !important;
        opacity: 0.75;
      }
    }
  }
  .move-back-block {
    position: absolute;
    left: 70px;
    bottom: 76px;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .revers-back-button {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ffffff3c;
      color: #ffffffd4;
      font-family: "Fjalla One";
      -webkit-text-stroke: 2px black;
      font-size: 34px;
      width: 66px;
      height: 66px;
      border: 2px solid #ffffff75;
      border-radius: 35px;
    }
  }
`;

const jumpInfinite = keyframes`
  0% { transform: skewX(-40deg); }
  2% { transform: skewX(40deg); }
  4% { transform: skewX(-40deg); }
  6% { transform: skewX(40deg); }
  8% { transform: skewX(0deg); }
  100% { transform: skewX(0deg); }  
 `;
export const ScrollDownWrapperStyled = styled.div<{
  $currentScroll?: number;
  $isVideoBlock?: number;
  $isMobile?: boolean;
}>`
  position: absolute;
  top: ${({ $currentScroll, $isVideoBlock }) =>
    ($currentScroll && $currentScroll > 0) || !!$isVideoBlock ? "-50" : "20"}px;
  transition: top 0.2s ease-in-out;
  left: 50%;
  font-family: "Fjalla One";
  font-size: 18px;
  color: white;
  transform: translate(-50%, 0);
  z-index: 1;
  .text {
    animation: ${jumpInfinite} 2.5s infinite;
  }
`;
