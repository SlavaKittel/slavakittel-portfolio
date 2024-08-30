import styled from "styled-components";

export default function ParticlesHeartApp() {
  return <ParticlesHeartAppStyled id="heart-app" />;
}

export const ParticlesHeartAppStyled = styled.div`
  width: 100%;
  height: 200vh;
  background-color: #cae29a;
  .test {
    z-index: 1;
    position: relative;
    font-size: 50px;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
    position: fixed;
  }
`;
