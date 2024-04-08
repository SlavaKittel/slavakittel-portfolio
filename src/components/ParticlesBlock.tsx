import { useRef, useEffect, useState } from "react";
import { Mesh } from "three";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

type ParticlesBlockProps = {
  position: [number, number, number];
};

export default function ParticlesBlock({ position }: ParticlesBlockProps) {
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);
  const particlesContainer = useRef<Mesh>(null);

  useEffect(() => {
    let contextBlock = gsap.context(() => {
      gsap.to(particlesContainer.current!.rotation, {
        scrollTrigger: {
          trigger: "#particlesContainer",
          scrub: 2,
          start: "top top",
          end: "bottom top",
        },
        y: Math.PI,
        immediateRender: false,
      });
      return () => contextBlock.revert();
    });
  }, []);

  return (
    <mesh
      position={position}
      scale={clicked ? 1.5 : 1}
      onClick={() => setClick(!clicked)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      ref={particlesContainer}
    >
      <boxGeometry args={[5, 5, 5]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
