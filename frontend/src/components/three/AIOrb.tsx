import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars, Torus } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function Core() {
  const mesh = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.25;
    mesh.current.rotation.x = THREE.MathUtils.lerp(
      mesh.current.rotation.x,
      mouse.current.y * 0.35,
      0.05,
    );
    mesh.current.rotation.z = THREE.MathUtils.lerp(
      mesh.current.rotation.z,
      mouse.current.x * 0.2,
      0.05,
    );
    const target = hovered ? 1.15 : 1;
    const ripple = 1 + Math.sin(state.clock.elapsedTime * 6 + clicked) * (clicked ? 0.05 : 0);
    mesh.current.scale.lerp(new THREE.Vector3(target * ripple, target * ripple, target * ripple), 0.08);
    if (inner.current) inner.current.rotation.y -= delta * 0.6;
  });

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked((c) => c + 1)}
    >
      <Sphere ref={mesh} args={[1.4, 128, 128]}>
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#7c3aed"
          emissiveIntensity={0.6}
          distort={hovered ? 0.55 : 0.38}
          speed={2.2}
          roughness={0.05}
          metalness={0.9}
        />
      </Sphere>
      <Sphere ref={inner} args={[1.05, 64, 64]}>
        <meshBasicMaterial color="#f0abfc" transparent opacity={0.12} />
      </Sphere>
      {/* Orbit rings */}
      <OrbitRing radius={2.1} tilt={[Math.PI / 2.2, 0, 0]} color="#c084fc" speed={0.35} />
      <OrbitRing radius={2.5} tilt={[Math.PI / 3, Math.PI / 5, 0]} color="#60a5fa" speed={-0.25} />
      <OrbitRing radius={2.9} tilt={[Math.PI / 1.6, Math.PI / 3, 0]} color="#f472b6" speed={0.18} />
    </group>
  );
}

function OrbitRing({
  radius,
  tilt,
  color,
  speed,
}: {
  radius: number;
  tilt: [number, number, number];
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <Torus ref={ref} args={[radius, 0.012, 16, 200]} rotation={tilt}>
      <meshBasicMaterial color={color} transparent opacity={0.55} />
    </Torus>
  );
}

function Particles({ count = 220 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useRef(
    Float32Array.from(
      { length: count * 3 },
      () => (Math.random() - 0.5) * 14,
    ),
  );
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#e9d5ff" transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

export function AIOrb() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="grid h-full w-full place-items-center">
        <div className="h-72 w-72 animate-pulse-glow rounded-full bg-gradient-aurora opacity-50 blur-2xl" />
      </div>
    );
  }
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#c084fc" />
      <pointLight position={[-5, -3, 2]} intensity={1} color="#60a5fa" />
      <pointLight position={[0, 4, -4]} intensity={0.8} color="#f472b6" />
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.8}>
        <Core />
      </Float>
      <Particles />
      <Stars radius={40} depth={30} count={1200} factor={3} fade speed={0.6} />
    </Canvas>
  );
}
