import { useState } from "react";
import { useProgress } from "@react-three/drei";
import styled from "styled-components";

type LoadingScreenProps = {
};

const LoadingScreen = ({}: LoadingScreenProps) => {
  const [loaded, setLoaded] = useState(false);

  const { progress } = useProgress();

  // TODO delete, for check on build
  console.log(progress);

  const handleClick = () => {
    if (progress === 100) setLoaded(true);
  };

  return (
    <LoadingScreenStyled $loaded={loaded} $progress={Number(progress.toFixed(0))}>
      <div className="start-loader" onClick={handleClick}>
        <div className="start-button-wrapper">
          <div className="start-button"></div>
        </div>
      </div>
      {/* TODO add icons and mobile version */}
      <div className="instruction-text">use WASD or Arrow Keys for move</div>
      <div className="instruction-text">SPACE for stop</div>
    </LoadingScreenStyled>
  );
};

export default LoadingScreen;

export const LoadingScreenStyled = styled.div<{
  $loaded: boolean;
  $progress: number;
}>`
  display: ${({ $loaded }) => ($loaded ? "none" : "flex")};
  position: fixed;
  background-color: #010101;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  font-family: "Fjalla One";
  .start-loader {
    display: flex;
    width: 254px;
    .start-button-wrapper {
      background-color: ${({ $progress }) => $progress === 100 ? '#50e7d7' : `#5eb0a8`};
      width: ${({ $progress }) => $progress}%;
      border-radius: 4px;
      .start-button {
        color: black;
        width: 250px;
        border: 2px solid ${({ $progress }) => $progress === 100 ? '#50e7d7' : `#5eb0a8`};
        border-radius: 4px;

        &:after {
          padding-left: 20px;
          content: "${({ $progress }) => $progress === 100 ? 'START' : `${$progress}%`}";
          display: block;
          text-align: center;
          font-size: 30px;
          padding: 10px 20px;
          color: ${({ $progress }) => $progress === 100 ? '#50e7d7' : `#5eb0a8`};
          mix-blend-mode: difference;
        }
      }
    }
  }
  .instruction-text {
    margin-top: 10px;
    color: white;
    font-size: 18px;
  }
`;
