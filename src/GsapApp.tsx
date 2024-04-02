import React, { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styled from "styled-components";

export default function GsapApp() {
  const gsapContainer = useRef<HTMLDivElement>(null);
  gsap.registerPlugin(ScrollTrigger);

  useGSAP(
    () => {

      // TODO naming and investigation
      // screw effect
      let proxy = { skew: 0 },
      skewSetter = gsap.quickSetter(".skew-element", "skewY", "deg"), // fast
      clamp = gsap.utils.clamp(-10, 10); // don't let the skew go beyond 20 degrees.
      ScrollTrigger.create({
        onUpdate: (self) => {
          let skew = clamp(self.getVelocity() / -300);
          // only do something if the skew is MORE severe. Remember, we're always tweening back to 0, so if the user slows their scrolling quickly, it's more natural to just let the tween handle that smoothly rather than jumping to the smaller skew.
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.8,
              ease: "power3",
              overwrite: true,
              onUpdate: () => skewSetter(proxy.skew),
            });
          }
        },
      });
      gsap.set(".skew-element", { transformOrigin: "center center", force3D: true });

      // TODO optimization with forEach() + naming
      gsap.from(".text1", {
        duration: 0.8,
        opacity: 0,
        y: 150,
      });
      gsap.from(".text2", {
        delay: 0.05,
        duration: 0.8,
        opacity: 0,
        y: 150,
      });
      gsap.from(".text3", {
        delay: 0.1,
        duration: 0.8,
        opacity: 0,
        y: 150,
      });
      gsap.to(".line-text", {
        scrollTrigger: {
          trigger: ".line-text",
          start: "top 100%",
          end: "bottom 0",
          scrub: true,
        },
        x: -1000,
      });
      gsap.to(".line-text2", {
        scrollTrigger: {
          trigger: ".line-text2",
          start: "top 100%",
          end: "bottom 0",
          scrub: true,
        },
        x: 1000,
      });
      gsap.to(".drift-car", {
        scrollTrigger: {
          trigger: ".drift-car",
          start: "top 100%",
          end: "bottom 0",
          scrub: true,
          markers: true,
        },
        y: -200,
      });
      gsap.to(".dji-goggles", {
        scrollTrigger: {
          trigger: ".dji-goggles",
          start: "top 100%",
          end: "bottom 0",
          scrub: true,
          // markers: true,
        },
        y: -800,
      });
    },
    { scope: gsapContainer }
  );
  // }, { depenedencies: [blabla], scope: gsapContainer});
  // }, { revertOnUpadate: true }); // animation will be start from the beginning every new render
  return (
    <GsapAppStyled ref={gsapContainer}>
      <div className="first-text-block">
        <div className="text1">Hello world</div>
        <div className="text2">Hello world</div>
        <div className="text3">Hello world</div>
      </div>
      <div className="line-text">
        Gucci Chanel Louis Vuitton Calvin Klein Tommy Hilfiger Ralph Lauren
        Versace Balenciaga Prada Armani Under Armour Puma The North Face
        Patagonia Columbia Uniqlo Supreme Burberry Diesel Fendi Michael Kors
        Lacoste Coach Guess ASOS
      </div>
      <div className="image-container">
        <img
          src="/img/drift-car.png"
          alt="drift-car"
          width="500"
          height="500"
          className="skew-element drift-car"
        />
        <img
          src="/img/dji-goggles.png"
          alt="dji-goggles"
          width="500"
          height="500"
          className="skew-element dji-goggles"
        />
      </div>
      <div className="line-text2">
        Supreme Burberry Diesel Fendi Michael Kors Lacoste Coach Guess ASOS
      </div>
    </GsapAppStyled>
  );
}

export const GsapAppStyled = styled.div`
  background-color: #ceeeef;
  height: 300vh;
  width: 100%;
  font-family: "Bebas Neue", sans-serif;
  font-weight: 400;
  font-style: normal;
  .first-text-block {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    .text1 {
      font-size: 80px;
    }
    .text2 {
      font-size: 80px;
    }
    .text3 {
      font-size: 80px;
    }
  }
  .line-text {
    font-size: 120px;
    white-space: nowrap;
  }
  .line-text2 {
    font-size: 120px;
    white-space: nowrap;
    position: relative;
    right: 1000px;
    color: #60989e;
  }
  .image-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100vh;
    .drift-car {
      position: relative;
      top: 100px;
    }
    .dji-goggles {
      position: relative;
      top: 350px;
    }
  }
`;
