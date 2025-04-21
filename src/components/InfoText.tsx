import { Text } from "@react-three/drei";

type TextProps = {};

const InfoText = ({}: TextProps) => {
  return (
    <>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-90, 0.1, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        TAKE THE WHEEL
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-86.5, 0.1, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={16}
        lineHeight={1.2}
        textAlign="center"
      >
        Navigate our virtual demo to see firsthand how intuitive 3D interaction
        can elevate your brand.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-69, 0.1, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        Welcome to SKIT — pioneers in crafting immersive 3D web experiences. We
        build interactive websites that captivate audiences and drive measurable
        growth.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-63.5, 0.1, 0]}
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
        position={[-27.2, 0.1, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        Experience the power of immersive design to boost engagement, tell
        compelling stories, and set your website apart from the competition.
      </Text>
      <Text
        color="#e8e8e8"
        fontSize={1}
        font="/fonts/FjallaOne-Regular.ttf"
        position={[-21.5, 0.1, 0]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
        maxWidth={17}
        lineHeight={1.2}
        textAlign="center"
      >
        Ready to rev up your online presence? Contact SKIT today to build
        your own next-level 3D website.
      </Text>
    </>
  );
};

export default InfoText;
