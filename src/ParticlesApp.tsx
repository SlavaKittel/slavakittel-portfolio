import { useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import styled from "styled-components";
import * as THREE from "three";

import { Html, useProgress } from "@react-three/drei";
import ParticlesBlock from "./components/ParticlesBlock";


export default function ParticlesApp() {
  function Loader() {
    console.log("LODAER");
    const { active, progress, errors, item, loaded, total } = useProgress();
    useEffect(() => {
      console.log(active, progress);
    }, [active, progress]);
    return <Html center>{progress} % loaded</Html>;
  }


  return (
    <ParticlesAppStyled>
      {/* TODO delete */}
      <div className="test">TESTTESTTEST</div>
      <div className="test">TESTTESTTEST</div>
      <div className="test">TESTTESTTEST</div>
      <div className="test" onClick={() => console.log("clickl")}>
        TESTTESTTEST
      </div>
      <Suspense fallback={<Loader />}>
        <CanvasStyled>
          <Canvas
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
            camera={{
              fov: 100,
              near: 0.1,
              far: 30,
              position: [10, 0, 8],
            }}
            id="particlesContainer"
            linear
            legacy
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 20, 20]} intensity={2} />
            <ParticlesBlock position={[0, 0, 0]} />
          </Canvas>
        </CanvasStyled>
      </Suspense>
    </ParticlesAppStyled>
  );
}

export const ParticlesAppStyled = styled.div`
  width: 100%;
  height: 200vh;
  overflow: scroll;
  .test {
    z-index: 1;
    position: relative;
    font-size: 50px;
  }
`;

export const CanvasStyled = styled.div`
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
`;
