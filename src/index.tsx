import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import GsapApp from "./GsapApp";
import ParticlesApp from "./ParticlesApp";

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
    path: "/particles",
    element: <ParticlesApp />,
  },
]);

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
