import { useState } from "react";
import { useProgress } from "@react-three/drei";
import styled from "styled-components";

import { isMobile } from "react-device-detect";

import WASDButtons from "../../public/img/WASDButtons";
import ArrowButtons from "../../public/img/ArrowButtons";
import SpaceButton from "../../public/img/SpaceButton";

type LoadingScreenProps = {};

const LoadingScreen = ({}: LoadingScreenProps) => {
  const [loaded, setLoaded] = useState(false);

  const { progress } = useProgress();

  const handleClick = () => {
    if (progress === 100) setLoaded(true);
  };

  const getInstructionContent = () => {
    if (isMobile) {
      return (
        <div className="instruction-mobile-content">
          <div className="move-around-block">
            <div className="joystick-icon" />
            <div className="move-around-text">- to move around</div>
          </div>
          <div className="move-back-block">
            <div className="back-icon">R</div>
            <div className="move-back-text">- to move back</div>
          </div>
          <div className="scroll-text">* use touch scroll for scroll page</div>
        </div>
      );
    }
    return (
      <div className="instruction-desktop-content">
        <div className="move-around-block">
          <WASDButtons />
          <div className="move-around-text">- to move around</div>
        </div>
        <div className="move-around-block">
          <ArrowButtons />
          <div className="move-around-text">- to move around</div>
        </div>
        <div className="space-block">
          <SpaceButton />
          <div className="space-text">- to brake</div>
        </div>
        <div className="scroll-text">* use mouse wheel for scroll page</div>
      </div>
    );
  };

  return (
    <LoadingScreenStyled
      $loaded={loaded}
      $progress={Number(progress.toFixed(0))}
    >
      <div className="start-loader" onClick={handleClick}>
        <div className="start-button-wrapper">
          <div className="start-button"></div>
        </div>
      </div>
      {getInstructionContent()}
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
      background-color: ${({ $progress }) =>
        $progress === 100 ? "#50e7d7" : "#5eb0a8"};
      width: ${({ $progress }) => $progress}%;
      border-radius: 4px;
      .start-button {
        color: black;
        width: 250px;
        border: 2px solid
          ${({ $progress }) => ($progress === 100 ? "#50e7d7" : "#5eb0a8")};
        border-radius: 4px;

        &:after {
          padding-left: 20px;
          content: "${({ $progress }) => $progress === 100 ? "START" : `${$progress}%`}";
          display: block;
          text-align: center;
          font-size: 30px;
          padding: 10px 20px;
          color: ${({ $progress }) =>
            $progress === 100 ? "#50e7d7" : "#5eb0a8"};
          mix-blend-mode: difference;
        }
      }
    }
  }

  .start-button-wrapper:hover {
    background: #0df9e1;
  }
  .start-button-wrapper:active {
    background: #57948d;
  }

  .instruction-desktop-content {
    font-size: 18px;
    .move-around-block {
      margin: 20px 0 20px 3px;
      display: flex;
      .move-around-text {
        margin-top: 40px;
        padding: 0 10px;
        color: white;
      }
    }
    .space-block {
      margin: 10px 0 10px 2px;
      display: flex;
      .space-text {
        margin-top: 13px;
        padding: 0 10px;
        color: white;
      }
    }
    .scroll-text {
      color: white;
      margin: 20px 0 0 6px;
    }
  }

  .instruction-mobile-content {
    font-size: 18px;
    .move-around-block {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      .joystick-icon {
        background-color: white;
        height: 20px;
        width: 20px;
        border-radius: 10px;
        &:after {
          content: "";
          height: 30px;
          width: 30px;
          background-color: transparent;
          display: flex;
          border-radius: 20px;
          border: 2px solid white;
          position: relative;
          left: -7px;
          top: -7px;
        }
      }
      .move-around-text {
        margin: 10px 0 10px 15px;
        color: white;
      }
    }
    .move-back-block {
      margin: 10px 24px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      .back-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: "Fjalla One";
        font-size: 15px;
        width: 30px;
        height: 30px;
        border: 2px solid white;
        border-radius: 20px;
      }
      .move-back-text {
        margin: 10px 0 10px 8px;
        color: white;
      }
    }
    .scroll-text {
      color: white;
      margin: 15px 0 0 6px;
    }
  }
`;
