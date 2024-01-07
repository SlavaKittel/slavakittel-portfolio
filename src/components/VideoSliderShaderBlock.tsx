import { useRef } from "react";
import * as THREE from "three";
import { isMobile } from "react-device-detect";

import { useFrame, extend } from "@react-three/fiber";
import { useTexture, shaderMaterial, useVideoTexture } from "@react-three/drei";

export const VideoFadeMaterial = shaderMaterial(
  {
    effectFactor: 1,
    dispFactor: 0,
    video: null,
    video2: null,
    distorTexture: null,
  },

  // vertexShader
  ` varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

  // fragmentShader
  ` varying vec2 vUv;
    uniform sampler2D video;
    uniform sampler2D video2;
    uniform sampler2D distorTexture;
    uniform float _rot;
    uniform float dispFactor;
    uniform float effectFactor;
    void main() {
      vec2 uv = vUv;
      vec4 distorTexture = texture2D(distorTexture, uv);
      vec2 distortedPosition = vec2(uv.x + dispFactor * (distorTexture.r*effectFactor), uv.y);
      vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (distorTexture.r*effectFactor), uv.y);
      vec4 _texture = texture2D(video, distortedPosition);
      vec4 _texture2 = texture2D(video2, distortedPosition2);
      vec4 finalTexture = mix(_texture, _texture2, dispFactor);
      gl_FragColor = finalTexture;
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`
);

extend({ VideoFadeMaterial });

// trick how to add type in typescript for extend
declare global {
  namespace JSX {
    interface IntrinsicElements {
      videoFadeMaterial: any;
    }
  }
}

type VideoSliderShaderProps = {
  position: [number, number, number];
  video1: string;
  video2: string;
  onClick: () => void;
  toggleSlider: boolean;
  setToggleSlider: (toggleSliderOne: boolean) => void;
  isKeydown: boolean;
};

const VideoSliderShaderBlock = ({
  position,
  video1,
  video2,
  onClick,
  toggleSlider,
  setToggleSlider,
  isKeydown,
}: VideoSliderShaderProps) => {
  const ref = useRef<any>();
  const [dispTexture] = useTexture(["/img/slider-shader.jpeg"]);
  useFrame(() => {
    ref.current.dispFactor = THREE.MathUtils.lerp(
      ref.current.dispFactor,
      toggleSlider ? 1 : 0,
      0.1
    );
  });
  return (
    <mesh
      onPointerOver={() => {
        if (!isKeydown && !isMobile) return setToggleSlider(true);
      }}
      onPointerOut={() => {
        if (!isKeydown && !isMobile) return setToggleSlider(false);
      }}
      position={position}
      scale={[17.5, 13.125, 10]}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      onClick={onClick}
      onPointerEnter={() => (document.body.style.cursor = "pointer")}
      onPointerLeave={() => (document.body.style.cursor = "default")}
    >
      <planeGeometry />
      <videoFadeMaterial
        ref={ref}
        video={useVideoTexture(video1)}
        video2={useVideoTexture(video2)}
        distorTexture={dispTexture}
        toneMapped={false}
      />
    </mesh>
  );
};

export default VideoSliderShaderBlock;
