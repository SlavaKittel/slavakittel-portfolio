import { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import styled, { keyframes } from "styled-components";
import { isMobile } from "react-device-detect";
import { TextureLoader } from "three/src/loaders/TextureLoader";
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
import FunZone from "./components/FunZone";
import LinkedInLogo from "./components/LinkedInLogo";
import VideoBlock from "./components/VideoBlock";
import Lights from "./components/Lights";

export default function App() {
  const { perfVisible, debug } = useLeva({
    perfVisible: true,
    debug: false,
  });
  const [isKeydown, setKeydown] = useState(true);
  const [currentScroll, setCurrentScroll] = useState(0);
  const [isVideoBlock, setIsVideoBlock] = useState(false);

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

  //Joystik Control
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
            <Lights />

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

            {/* Fun Zone and Test Performance */}
            <FunZone />

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
