import { Mesh, MeshStandardMaterial } from "three";

import WheelURl from "../../public/glb-models/bmwe30wheels.glb?url";
import { GLTF } from "three-stdlib";
import { useGLTF } from "@react-three/drei";

type WheelGLTF = GLTF & {
  nodes: {
    wheel_FR_bbs_tex002_0: Mesh;
    wheel_FR_blt002_0: Mesh;
    wheel_FR_disk002_0: Mesh;
    wheel_FR_disk_paint002_0: Mesh;
    wheel_FR_tire002_0: Mesh;
  };
  materials: {
    "disk.002": MeshStandardMaterial;
    "disk_brake.001": MeshStandardMaterial;
    "disk_brake_tr.001": MeshStandardMaterial;
    "disk_paint.002": MeshStandardMaterial;
    "tire.002": MeshStandardMaterial;
  };
};

type WheelProps = JSX.IntrinsicElements["group"] & {
  side: "left" | "right";
  radius: number;
  rotation: [number, number, number];
};

const Wheel = ({ side, rotation, radius, ...props }: WheelProps) => {
  const { nodes, materials } = useGLTF(WheelURl) as WheelGLTF;
  const scale = radius * 4;
  return (
    <group dispose={null} {...props}>
      <group scale={scale}>
        <group scale={side === "left" ? -1 : 1}>
          <mesh
            rotation={rotation}
            geometry={nodes.wheel_FR_bbs_tex002_0.geometry}
            material={materials["disk.002"]}
          />
          <mesh
            rotation={rotation}
            geometry={nodes.wheel_FR_blt002_0.geometry}
            material={materials["disk_brake.001"]}
          />
          <mesh
            rotation={rotation}
            geometry={nodes.wheel_FR_disk002_0.geometry}
            material={materials["disk_brake_tr.001"]}
          />
          <mesh
            rotation={rotation}
            geometry={nodes.wheel_FR_disk_paint002_0.geometry}
            material={materials["disk_paint.002"]}
          />
          <mesh
            rotation={rotation}
            geometry={nodes.wheel_FR_tire002_0.geometry}
            material={materials["tire.002"]}
          />
        </group>
      </group>
    </group>
  );
};

export default Wheel;
