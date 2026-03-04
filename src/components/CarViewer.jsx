// components/CarViewer.jsx
import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment }       from "@react-three/drei";
import * as THREE from "three";

function CarMesh({ modelPath, bodyColor, scaleOverride }) {
  const { scene } = useGLTF(modelPath);
  const groupRef  = useRef();

  const isDragging = useRef(false);
  const lastX      = useRef(0);
  const velocity   = useRef(0);
  const targetRotY = useRef(0);

  // Apply body color
  useEffect(() => {
    if (!scene) return;
    const color = new THREE.Color(bodyColor);
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const name = (child.name || "").toLowerCase();
      const isExcluded =
        name.includes("glass") || name.includes("window") ||
        name.includes("light") || name.includes("lamp")   ||
        name.includes("tire")  || name.includes("tyre")   ||
        name.includes("wheel") || name.includes("rim")    ||
        name.includes("rubber")|| name.includes("interior")||
        name.includes("seat");
      if (!isExcluded && child.material) {
        const m = child.material.clone();
        m.color.set(color);
        if (m.metalness !== undefined) m.metalness = 0.88;
        if (m.roughness !== undefined) m.roughness = 0.12;
        child.material = m;
      }
    });
  }, [scene, bodyColor]);

  // Center + scale, floor-anchored
  useEffect(() => {
    if (!scene || !groupRef.current) return;
    const box    = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = (scaleOverride ?? 3.6) / maxDim;

    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale
    );
  }, [scene]);

  // Horizontal drag → Y rotation only
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e) => {
      isDragging.current = true;
      lastX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      velocity.current = 0;
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const x  = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = x - lastX.current;
      velocity.current    = dx * 0.012;
      targetRotY.current += dx * 0.012;
      lastX.current = x;
    };
    const onUp = () => { isDragging.current = false; };

    canvas.addEventListener("mousedown",  onDown);
    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("mouseup",    onUp);
    canvas.addEventListener("mouseleave", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: true });
    canvas.addEventListener("touchmove",  onMove, { passive: true });
    canvas.addEventListener("touchend",   onUp);
    return () => {
      canvas.removeEventListener("mousedown",  onDown);
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("mouseup",    onUp);
      canvas.removeEventListener("mouseleave", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove",  onMove);
      canvas.removeEventListener("touchend",   onUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (!isDragging.current) {
      velocity.current   *= 0.92;
      targetRotY.current += velocity.current;
    }
    groupRef.current.rotation.y +=
      (targetRotY.current - groupRef.current.rotation.y) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#C8A96E" wireframe />
    </mesh>
  );
}

export default function CarViewer({ modelPath, bodyColor, scaleOverride, cameraPosition }) {
  const camPos = cameraPosition || [0,0.6,3.2];
  return (
    <Canvas
      camera={{ position: camPos, fov: 46 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]}   intensity={1.4} />
      <directionalLight position={[-5, 4, -3]} intensity={0.7} />
      <pointLight       position={[0, 5, 0]}   intensity={0.9} color="#ffffff" />
      <pointLight       position={[3, 1, 3]}   intensity={0.5} color="#C8A96E" />
      <Environment preset="warehouse" />
      <Suspense fallback={<Loader />}>
        <CarMesh modelPath={modelPath} bodyColor={bodyColor} scaleOverride={scaleOverride} />
      </Suspense>
    </Canvas>
  );
}