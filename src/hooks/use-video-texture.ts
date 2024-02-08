import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { suspend } from "suspend-react";

interface VideoTextureProps extends HTMLVideoElement {
  unsuspend?: "canplay" | "canplaythrough" | "loadstart" | "loadedmetadata";
  start?: boolean;
}

export function useVideoTexture(
  src: string | MediaStream,
  props?: Partial<VideoTextureProps>
) {
  const { unsuspend, start, crossOrigin, muted, loop, ...rest } = {
    unsuspend: "loadedmetadata",
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    ...props,
  };
  const gl = useThree((state) => state.gl);
  const texture = suspend(
    () =>
      new Promise((res, rej) => {
        const video = Object.assign(document.createElement("video"), {
          src: (typeof src === "string" && src) || undefined,
          srcObject: (src instanceof MediaStream && src) || undefined,
          crossOrigin,
          loop,
          muted,
          ...rest,
        });
        const texture = new THREE.VideoTexture(video) as THREE.Texture;
        if ("colorSpace" in texture)
          (texture as any).colorSpace = (gl as any).outputColorSpace;
        else (texture as any).encoding = gl.outputEncoding;

        document.addEventListener("click", () => video.play());
        document.addEventListener("touchstart", () => video.play());
        video.addEventListener(unsuspend, () => res(texture));
      }),
    [src]
  ) as THREE.VideoTexture;
  useEffect(() => {
    if (start) {
      texture.image.play();
      return () => texture.image.pause();
    }
  }, [texture, start]);
  return texture;
}
