import { useState, useEffect, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import styled, { keyframes } from "styled-components";
import { isMobile } from "react-device-detect";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

import { Leva } from "leva";

import { Perf } from "r3f-perf";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useControls as useLeva } from "leva";
import { ScrollControls, MeshReflectorMaterial, Text } from "@react-three/drei";

import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";

import Vehicle from "./components/Vehicle/Vehicle";
import MainText from "./components/MainText";
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

  //Joystick Control
  const [maxForceMobile, setMaxForceMobile] = useState<number>(0);
  const [angleOfJoystick, setAngleOfJoystick] = useState(0);

  const moveHandler = (event: IJoystickUpdateEvent) => {
    if (!event.y || !event.x || !event.distance) return;

    const getAngle = (y: number, x: number) => {
      const angleOf180 = (Math.atan2(y, x) * 180) / Math.PI;
      const angleOf360 = angleOf180 < 0 ? angleOf180 + 360 : angleOf180;
      return angleOf360;
    };

    const angleOfJoystickValue = getAngle(event.y, event.x);

    setMaxForceMobile(event.distance);
    setAngleOfJoystick(angleOfJoystickValue);
    setKeydown(true);
  };

  const moveHandlerStop = () => {
    setMaxForceMobile(-50);
    setAngleOfJoystick(0);
  };

  //Ground Texture
  const [roughness, normal, aoMap] = useLoader(TextureLoader, [
    "./texture/MetalBronzeWorn001_ROUGHNESS_1K_METALNESS.png",
    "./texture/MetalBronzeWorn001_NRM_1K_METALNESS.png",
    "./texture/MetalBronzeWorn001_DISP16_1K_METALNESS.png",
  ]);
  const repeatTextures = (texture: {
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
  repeatTextures(roughness);
  repeatTextures(normal);
  repeatTextures(aoMap);

  return (
    <>
      <Suspense fallback={null}>
        {
          <AppStyled $isVideoBlock={isVideoBlock}>
            <Leva collapsed />
            {isMobile && (
              <JoystickStyled>
                <Joystick
                  size={100}
                  move={moveHandler}
                  stop={moveHandlerStop}
                />
              </JoystickStyled>
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
              // TODO need to apply true srgb color
              // frameloop="demand"
              // shadowMap={{ enabled: true, type: "BasicShadowMap"}}
              dpr={[1, 2]} // default pixelRatio //TODO need?
              camera={{
                fov: 35,
              }}
              id="appCanvas"
              linear // TODO need to apply true srgb color
              legacy // TODO need to apply true srgb color
            >
              {perfVisible && <Perf position="top-left" />}
              <color args={["#6b7272"]} attach="background" />
              <Text
                color="#e8e8e8"
                fontSize={1}
                font="/fonts/FjallaOne-Regular.ttf"
                position={[-74, 0, 0]}
                rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
                maxWidth={17}
                lineHeight={1.2}
                textAlign="center"
              >
                I'm Slava, and my mission is to lead the way in 3D web user
                interaction. Now, you can buy my products and services to
                transform your digital presence. Together, we'll shape the
                future of web interaction for your success.
              </Text>
              <Text
                color="#e8e8e8"
                fontSize={1}
                font="/fonts/FjallaOne-Regular.ttf"
                position={[-63, 0, 0]}
                rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
                maxWidth={17}
                lineHeight={1.0}
                textAlign="center"
              >
                Good examples, what we expect by 3d web user interaction
              </Text>
              <Physics
                timeStep={1 / 400}
                updatePriority={-50}
                gravity={[0, -9.08, 0]}
                debug={debug}
                maxStabilizationIterations={8}
              >
                {/* Lights */}
                <Lights />
                {/* Main text */}
                <MainText />
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
                {/* Social links */}
                <SocialNetworkLogo
                  position={[-23, 1.4, 2.5]}
                  link="https://www.linkedin.com/in/slavakittel/"
                  model="./glb-models/linkedin-logo.glb"
                />
                <SocialNetworkLogo
                  position={[-23, 1.4, -2.5]}
                  link="https://github.com/SlavaKittel"
                  model="./glb-models/github-logo.glb"
                />
                {/* Fun Zone and Test Performance */}
                <FunZone
                  positionX={10}
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
                  />
                </ScrollControls>
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
                    {/* TODO need to choose for best performance */}
                    <MeshReflectorMaterial
                      envMapIntensity={0}
                      normalMap={normal}
                      roughnessMap={roughness}
                      aoMap={aoMap}
                      // normalScale={[0.8, 0.8]}
                      dithering={true}
                      color={[0.021, 0.025, 0.028]}
                      roughness={0.9}
                      metalness={0.1}
                      blur={[2000, 2000]} // Blur ground reflections (width, heigt), 0 skips blur
                      mixBlur={30} // How much blur mixes with surface roughness (default = 1)
                      mixStrength={80} // Strength of the reflections
                      mixContrast={1} // Contrast of the reflections
                      resolution={isMobile ? 80 : 250} // Off-buffer resolution, lower=faster, higher=better quality, slower
                      mirror={0} // Mirror environment, 0 = texture colors, 1 = pick up env colors
                      depthScale={0.01} // Scale the depth factor (0 = no depth, default = 0)
                      minDepthThreshold={0.8} // Lower edge for the depthTexture interpolation (default = 0)
                      maxDepthThreshold={1} // Upper edge for the depthTexture interpolation (default = 0)
                      depthToBlurRatioBias={0.2} // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
                    />
                    {/* <MeshReflectorMaterial
                      blur={[500, 500]}
                      resolution={250}
                      mixBlur={1}
                      mixStrength={50}
                      roughness={0.8}
                      depthScale={0.4}
                      minDepthThreshold={1}
                      maxDepthThreshold={1.4}
                      color="#050708"
                      metalness={0.9}
                      mirror={0}
                    /> */}
                    {/* <meshStandardMaterial roughness={0} metalness={1} color="blue" /> */}
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
  & > div > div > div {
    overflow: ${({ $isVideoBlock }) =>
      !!$isVideoBlock ? "hidden !important;" : "unset"};
  }
`;

export const JoystickStyled = styled.div`
  display: flex;
  position: absolute;
  bottom: 60px;
  margin-right: auto;
  margin-left: auto;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 1;
  & > div {
    background: transparent !important;
    border: 2px solid #ffffff79;
    & > button {
      background: url("/img/joystick-logo.jpg") no-repeat center !important;
      background-size: 180% !important;
      opacity: 0.98;
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
  font-weight: 900;
  font-size: 18px;
  color: #212121;
  transform: translate(-50%, 0);
  z-index: 1;
  .text {
    animation: ${jumpInfinite} 2.5s infinite;
  }
`;
