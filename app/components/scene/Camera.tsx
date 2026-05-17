"use client";
import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useCameraStore } from "../../store/cameraStore";

const Camera = () => {
  const controlsRef = useRef<CameraControls>(null);
  const target = useCameraStore((s) => s.target);
  const position = useCameraStore((s) => s.position);
  const isMoving = useCameraStore((s) => s.isMoving);
  const setMoving = useCameraStore((s) => s.setMoving);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.setLookAt(0, 3, 3.5, 0, 1.7, 0, false);
  }, []);

  useEffect(() => {
    if (!isMoving || !controlsRef.current) return;

    controlsRef.current.setLookAt(
      position.x, position.y, position.z,
      target.x, target.y, target.z,
      true
    ).then(() => setMoving(false));
  }, [isMoving, target, position, setMoving]);

  return <CameraControls ref={controlsRef} makeDefault dollyToCursor />;
};

export default Camera;
