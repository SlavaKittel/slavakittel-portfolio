import React from "react";
import ReactDOM from "react-dom/client";
import styled from "styled-components";
import App from "./App";

export const AppCanvasStyled = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <AppCanvasStyled>
      <App />
    </AppCanvasStyled>
  </React.StrictMode>
);