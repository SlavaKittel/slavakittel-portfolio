import React, { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LoadingScreen from "./components/LoadingScreen";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <Suspense fallback={null}>{<App />}</Suspense>
    <LoadingScreen />
  </StrictMode>
);
