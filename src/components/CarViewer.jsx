// components/CarViewer.jsx
import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment }       from "@react-three/drei";
import * as THREE from "three";

// ─── Per-model recolor logic ────────────────────────────────────────────────
//
//  Taycan  → mesh name ends with "_mm_ext"          (exterior panel suffix)
//  GT3 992 → mesh name contains "carpaint"          (TwiXeR naming)
//  Carrera GT, 959, 911 GT1, 993 GT2                (Porsche LP Classic family)
//          → mesh name contains "paint"             (bodyPaint_Geo / PPaint_Geo)
//  930 Turbo → Object_N names, no semantic info     (full-body color, best effort)
//
//  GT2 specific: "coloured" mesh → always gloss black (trim/window frames)
// ─────────────────────────────────────────────────────────────────────────────

function shouldRecolorMesh(name) {
  const n = name.toLowerCase();
  if (n.endsWith("_mm_ext")) return true;
  if (n.includes("carpaint")) return true;
  if (n.includes("paint") && !n.includes("carpaint")) return true;
  return false;
}

function isExcludedMesh(name) {
  const n = name.toLowerCase();
  return (
    n.includes("glass")      || n.includes("window")    ||
    n.includes("light")      || n.includes("lamp")      ||
    n.includes("tire")       || n.includes("tyre")      ||
    n.includes("wheel")      || n.includes("rim")       ||
    n.includes("rubber")     || n.includes("interior")  ||
    n.includes("seat")       || n.includes("cab")       ||
    n.includes("chassis")    || n.includes("badge")     ||
    n.includes("misc")       || n.includes("brake")     ||
    n.includes("caliper")    || n.includes("carbon")    ||
    n.includes("engine")     || n.includes("grille")    ||
    n.includes("exhaust")    || n.includes("mirror")    ||
    n.includes("chrome")     || n.includes("underbody") ||
    n.includes("carpet")     || n.includes("fabric")    ||
    n.includes("leather")    || n.includes("seatbelt")  ||
    n.includes("steer")      || n.includes("pedal")     ||
    n.includes("dash")       || n.includes("gauges")    ||
    n.includes("headlight")  || n.includes("taillight") ||
    n.includes("brakelight") || n.includes("signal")    ||
    n.includes("phong")      || n.includes("emiss")     ||
    n.includes("textured")   || n.includes("coloured")  ||
    n.includes("base_geo")   || n.includes("_mm_cab")   ||
    n.includes("_mm_chassis")|| n.includes("_mm_badges")||
    n.includes("_mm_misc")   || n.includes("_mm_lights")||
    n.includes("_mm_windows")
  );
}

function getRecolorDecision(name) {
  if (shouldRecolorMesh(name)) return true;
  if (isExcludedMesh(name)) return false;
  const n = name.toLowerCase();
  if (!n.includes("_mm_") && !n.includes("carpaint") && !n.includes("paint")) {
    if (/^object_\d+$/i.test(name.trim())) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────

function CarMesh({ modelPath, bodyColor, scaleOverride, pivotCorrection = 0 }) {
  const { scene } = useGLTF(modelPath);
  const groupRef  = useRef();
  const innerRef  = useRef();

  const isDragging = useRef(false);
  const lastX      = useRef(0);
  const velocity   = useRef(0);
  const targetRotY = useRef(0);

  // Apply body color + fixed accent colors
  useEffect(() => {
    if (!scene) return;
    const color      = new THREE.Color(bodyColor);
    const glossBlack = new THREE.Color("#111111");

    scene.traverse((child) => {
      if (!child.isMesh) return;

      const name = child.name || "";
      const n    = name.toLowerCase();

      // GT2 specific: force "coloured" meshes (window frames, trim) to gloss black
      if (n.includes("coloured") && !n.includes("interior") && !n.includes("seatbelt")) {
        const m = child.material.clone();
        m.map       = null;
        m.color.set(glossBlack);
        m.metalness   = 0.7;
        m.roughness   = 0.25;
        m.needsUpdate = true;
        child.material = m;
        return;
      }

      const recolor = getRecolorDecision(name);
      if (recolor && child.material) {
        const m = child.material.clone();
        m.map     = null;
        m.color.set(color);
        m.metalness   = 0.88;
        m.roughness   = 0.12;
        m.needsUpdate = true;
        child.material = m;
      }
    });
  }, [scene, bodyColor]);

  // Center + scale, floor-anchored with two-group pivot fix
  useEffect(() => {
    if (!scene || !groupRef.current || !innerRef.current) return;

    const box    = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = (scaleOverride ?? 3.6) / maxDim;

    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.set(
      0,
      (center.y - box.min.y) * scale + pivotCorrection,
      0
    );

    innerRef.current.position.set(
      -center.x,
      -center.y,
      -center.z
    );
  }, [scene, pivotCorrection]);

  // Horizontal drag → Y rotation with inertia
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e) => {
      isDragging.current = true;
      lastX.current      = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      velocity.current   = 0;
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
      <group ref={innerRef}>
        <primitive object={scene} />
      </group>
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

export default function CarViewer({
  modelPath,
  bodyColor,
  scaleOverride,
  cameraPosition,
  pivotCorrection,
}) {
  const camPos = cameraPosition || [0, 0.6, 3.2];
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
        <CarMesh
          modelPath={modelPath}
          bodyColor={bodyColor}
          scaleOverride={scaleOverride}
          pivotCorrection={pivotCorrection}
        />
      </Suspense>
    </Canvas>
  );
}