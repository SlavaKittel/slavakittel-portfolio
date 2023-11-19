import { useMemo } from "react";

type LightsProps = {};
type PointLightSpecProp = {
  key: string;
  position: [number, number, number];
  intensity: number;
};

const Lights = ({}: LightsProps) => {
  const pointLighCount = 10;
  const pointLighWidth = 30;
  const pointLighIntensity = 0.35;

  const pointLightsSpec = useMemo(() => {
    const specification: PointLightSpecProp[] = [];
    for (let i = 0; i < pointLighCount; i += 1) {
      specification.push({
        key: "spec_" + Math.random(),
        position: [
          -110 + i * 20,
          5,
          (i % 2) * pointLighWidth - pointLighWidth / 2,
        ],
        intensity: pointLighIntensity,
      });
    }
    return specification;
  }, []);

  const getPointLights = () => {
    return pointLightsSpec.map((pointLightSpec) => (
      <pointLight
        key={pointLightSpec.key}
        position={pointLightSpec.position}
        intensity={pointLightSpec.intensity}
      />
    ));
  };

  return (
    <>
      {getPointLights()}
      <ambientLight intensity={0.5} />
    </>
  );
};

export default Lights;
