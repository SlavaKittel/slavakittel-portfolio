import { Text } from "@react-three/drei";

type TextProps = {};

const InfoText = ({}: TextProps) => {
  return (
    <>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-76.5, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        Welcome!
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-74, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        I'm Slava, a dedicated pioneer of 3D web.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-69, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        3D web design improves user experience, engagement, and decision-making
        process. It enhances storytelling, product showcasing and boosts brand
        recognition.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-63.5, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.0}
        textAlign="center"
      >
        Some great examples:
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-28.7, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.0}
        textAlign="center"
      >
        Stay ahead of the game.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-25.5, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.0}
        textAlign="center"
      >
        Choose the future of web interaction and make your website stand out.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-22, 0, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.0}
        textAlign="center"
      >
        Let’s connect and discuss:
      </Text>
    </>
  );
};

export default InfoText;
