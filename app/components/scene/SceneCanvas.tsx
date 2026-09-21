"use client";

import { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useAnatomyStore } from "../../store/anatomyStore";
import Camera from "./Camera";
import { MeshScanner } from "./MeshScanner";
import { HighlightSystem } from "./HighlightSystem";
import { InteractiveScene } from "./InteractiveScene";

type Props = {
  children: ReactNode;
  showGrid?: boolean;
  background?: string;
};

export function SceneCanvas({ children, showGrid = false, background }: Props) {
  const setSelected = useAnatomyStore((s) => s.setSelected);
  const setIsolated = useAnatomyStore((s) => s.setIsolated);

  return (
    <Canvas
      style={background ? { background } : undefined}
      onPointerMissed={() => {
        setSelected(null, null);
        setIsolated(null);
      }}
    >
      <Camera />

      <MeshScanner />
      {showGrid ? <gridHelper args={[20, 20]} /> : null}

      <InteractiveScene>{children}</InteractiveScene>

      <HighlightSystem />
      <directionalLight position={[4, 2, 3]} intensity={1.7} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />
    </Canvas>
  );
}
