import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import GsapApp from "./GsapApp";
import ParticlesHeartApp from "./ParticlesHeartApp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/gsap",
    element: <GsapApp />,
  },
  {
    path: "/heart",
    element: <ParticlesHeartApp />,
  },
]);

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
