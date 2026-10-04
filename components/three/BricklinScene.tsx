'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
  RoundedBox,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import { BricklinCar } from '@/components/site/BricklinCar';

type ScenePreset = 'hero' | 'configurator' | 'detail';

type BricklinSceneProps = {
  color?: string;
  accent?: string;
  preset?: ScenePreset;
  interactive?: boolean;
  className?: string;
  sport?: boolean;
  /** Gullwing doors raised. */
  doorsOpen?: boolean;
  /** 0–1 scroll progress. When set, the camera flies through STORY_SHOTS instead of orbiting. */
  progressRef?: MutableRefObject<number>;
};

type Vec3 = [number, number, number];

const PEARL = '#eef1f5';
const RIM_ACCENT = '#3fa9ff';

/* --------------------------------------------------------------- Parts */

function Wheel({ position, sport = false }: { position: Vec3; sport?: boolean }) {
  return (
    <group position={position}>
      {/* Tyre: torus lies in XY, so its axle already points along Z (sideways). */}
      <mesh castShadow>
        <torusGeometry args={[0.34, 0.12, 18, 48]} />
        <meshStandardMaterial color="#07080b" roughness={0.82} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.14, sport ? 10 : 6]} />
        <meshStandardMaterial color={sport ? '#22262d' : '#c9ced6'} roughness={0.2} metalness={0.92} />
      </mesh>
      <mesh position={[0, 0, 0.072]}>
        <torusGeometry args={[0.255, 0.018, 8, 48]} />
        <meshStandardMaterial color={RIM_ACCENT} emissive={RIM_ACCENT} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.16, 20]} />
        <meshStandardMaterial color="#e11d2e" roughness={0.3} metalness={0.65} />
      </mesh>
    </group>
  );
}

/** One of the two big front intakes, with a turbine fan that spins. */
function TurbineIntake({ z, animate }: { z: number; animate: boolean }) {
  const fan = useRef<THREE.Group>(null);
  const blades = useMemo(() => Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2), []);

  useFrame((_, delta) => {
    if (fan.current && animate) fan.current.rotation.x += delta * 2.2 * Math.sign(z || 1);
  });

  return (
    <group position={[-1.9, 0.6, z]}>
      {/* Black surround */}
      <RoundedBox args={[0.12, 0.42, 0.56]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#05060a" roughness={0.45} metalness={0.4} />
      </RoundedBox>
      {/* Fan, axle along X */}
      <group ref={fan} position={[-0.065, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 18]} />
          <meshStandardMaterial color="#9aa3b0" roughness={0.25} metalness={0.9} />
        </mesh>
        {blades.map((a) => (
          <mesh key={a} rotation={[a, 0, 0]} position={[0, Math.sin(a) * 0.0, 0]}>
            <boxGeometry args={[0.012, 0.32, 0.05]} />
            <meshStandardMaterial color="#2a2f38" roughness={0.3} metalness={0.85} />
          </mesh>
        ))}
      </group>
      {/* Faint inner glow */}
      <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.17, 32]} />
        <meshBasicMaterial color="#1a2330" />
      </mesh>
    </group>
  );
}

function Emissive({ args, position, rotation = [0, 0, 0], color }: { args: Vec3; position: Vec3; rotation?: Vec3; color: string }) {
  return (
    <RoundedBox args={args} radius={Math.min(...args) / 2.2} smoothness={3} position={position} rotation={rotation}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} toneMapped={false} />
    </RoundedBox>
  );
}

/** Gullwing door hinged on the roof spine. side = 1 (right / +z) or -1 (left / -z). */
function GullwingDoor({ side, open, paint }: { side: 1 | -1; open: boolean; paint: THREE.Material }) {
  const hinge = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!hinge.current) return;
    const target = open ? -0.95 * side : 0;
    hinge.current.rotation.x = THREE.MathUtils.damp(hinge.current.rotation.x, target, 3.2, delta);
  });

  return (
    <group ref={hinge} position={[0.1, 1.4, 0.2 * side]}>
      <group position={[0, -0.24, 0.27 * side]} rotation={[-0.55 * side, 0, 0]}>
        {/* Tinted glass */}
        <RoundedBox args={[1.32, 0.46, 0.04]} radius={0.018} smoothness={3} castShadow>
          <meshPhysicalMaterial color="#0d1520" roughness={0.06} metalness={0.3} clearcoat={1} transparent opacity={0.9} />
        </RoundedBox>
        {/* Painted lower door skin */}
        <RoundedBox args={[1.36, 0.1, 0.06]} radius={0.03} smoothness={3} position={[0, -0.25, 0]} castShadow>
          <primitive object={paint} attach="material" />
        </RoundedBox>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------- Vehicle */

function Vehicle({
  color,
  accent,
  interactive,
  sport,
  animate,
  doorsOpen,
}: {
  color: string;
  accent: string;
  interactive: boolean;
  sport: boolean;
  animate: boolean;
  doorsOpen: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const paint = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.2,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        sheen: 0.4,
        sheenColor: new THREE.Color('#ffffff'),
      }),
    [color],
  );
  const stripe = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#fbfcfd', roughness: 0.12, metalness: 0.2, clearcoat: 1 }),
    [],
  );
  const black = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#07090d', roughness: 0.32, metalness: 0.7 }),
    [],
  );

  useEffect(() => () => paint.dispose(), [paint]);
  useEffect(() => () => { stripe.dispose(); black.dispose(); }, [stripe, black]);

  useFrame((state, delta) => {
    if (!group.current || !interactive || !animate) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, 0.15 + state.pointer.x * 0.16, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.04, 4, delta);
  });

  // The car faces -X. Width runs along Z.
  return (
    <group ref={group} rotation={[0, 0.15, 0]} position={[0, -0.2, 0]}>
      <Float speed={animate ? 1.1 : 0} rotationIntensity={animate ? 0.03 : 0} floatIntensity={animate ? 0.07 : 0}>
        {/* Squash slightly: the real 3EV sits low and wide. */}
        <group scale={[1.04, 0.86, 1.08]} position={[0, -0.08, 0]}>
          {/* ---- Body shell ---- */}
          <RoundedBox args={[3.4, 0.62, 1.6]} radius={0.28} smoothness={8} position={[0.05, 0.7, 0]} castShadow>
            <primitive object={paint} attach="material" />
          </RoundedBox>
          {/* Broad front face */}
          <RoundedBox args={[0.8, 0.7, 1.7]} radius={0.24} smoothness={8} position={[-1.52, 0.64, 0]} castShadow>
            <primitive object={paint} attach="material" />
          </RoundedBox>
          {/* Tapered tail */}
          <mesh position={[1.45, 0.74, 0]} scale={[0.95, 0.42, 0.74]} castShadow>
            <sphereGeometry args={[0.72, 40, 24]} />
            <primitive object={paint} attach="material" />
          </mesh>

          {/* ---- Signature front: centre spine, turbine intakes, LED brackets ---- */}
          <RoundedBox args={[0.08, 0.64, 0.24]} radius={0.035} smoothness={3} position={[-1.94, 0.66, 0]} material={stripe} />
          <RoundedBox args={[0.06, 0.6, 0.03]} radius={0.012} smoothness={2} position={[-1.935, 0.66, 0.135]} material={black} />
          <RoundedBox args={[0.06, 0.6, 0.03]} radius={0.012} smoothness={2} position={[-1.935, 0.66, -0.135]} material={black} />
          <TurbineIntake z={0.47} animate={animate} />
          <TurbineIntake z={-0.47} animate={animate} />

          {[1, -1].map((s) => (
            <group key={s}>
              <Emissive args={[0.05, 0.46, 0.05]} position={[-1.9, 0.68, 0.8 * s]} rotation={[0.12 * s, 0, 0]} color="#f4f9ff" />
              <Emissive args={[0.05, 0.05, 0.2]} position={[-1.88, 0.92, 0.71 * s]} color="#f4f9ff" />
              <Emissive args={[0.05, 0.05, 0.14]} position={[-1.88, 0.43, 0.74 * s]} color="#f4f9ff" />
            </group>
          ))}

          {/* Splitter */}
          <RoundedBox args={[0.32, 0.08, 1.56]} radius={0.035} smoothness={3} position={[-1.78, 0.3, 0]} material={black} />

          {/* Hood + roof spine stripe, flowing nose to tail */}
          <RoundedBox args={[1.35, 0.05, 0.24]} radius={0.02} smoothness={2} position={[-1.22, 1.0, 0]} material={stripe} />
          <RoundedBox args={[0.78, 0.06, 0.2]} radius={0.02} smoothness={2} position={[-0.34, 1.2, 0]} rotation={[0, 0, 0.52]} material={stripe} />
          <RoundedBox args={[1.25, 0.07, 0.4]} radius={0.03} smoothness={3} position={[0.42, 1.41, 0]} material={stripe} />
          <RoundedBox args={[0.8, 0.05, 0.2]} radius={0.02} smoothness={2} position={[1.36, 1.2, 0]} rotation={[0, 0, -0.5]} material={stripe} />

          {/* Windshield and rear glass */}
          <RoundedBox args={[0.8, 0.04, 1.08]} radius={0.016} smoothness={2} position={[-0.36, 1.18, 0]} rotation={[0, 0, 0.52]}>
            <meshPhysicalMaterial color="#0b121c" roughness={0.04} metalness={0.4} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.82, 0.04, 0.84]} radius={0.016} smoothness={2} position={[1.36, 1.18, 0]} rotation={[0, 0, -0.5]}>
            <meshPhysicalMaterial color="#0b121c" roughness={0.04} metalness={0.4} clearcoat={1} />
          </RoundedBox>

          {/* Cabin seats (visible when doors open) */}
          {[0.3, -0.3].map((z) => (
            <RoundedBox key={z} args={[0.5, 0.5, 0.4]} radius={0.1} smoothness={4} position={[0.35, 1.08, z]} rotation={[0, 0, -0.2]}>
              <meshStandardMaterial color="#1b1e24" roughness={0.7} />
            </RoundedBox>
          ))}

          <GullwingDoor side={1} open={doorsOpen} paint={paint} />
          <GullwingDoor side={-1} open={doorsOpen} paint={paint} />

          {/* Lower aero blade + side intakes */}
          <RoundedBox args={[3.1, 0.16, 1.5]} radius={0.07} smoothness={4} position={[0.05, 0.4, 0]} material={black} castShadow />
          {[1, -1].map((s) => (
            <RoundedBox key={s} args={[0.62, 0.17, 0.04]} radius={0.05} smoothness={3} position={[0.78, 0.66, 0.8 * s]} material={black} />
          ))}

          {/* Two front wheels, one rear */}
          <Wheel position={[-1.12, 0.34, 0.9]} sport={sport} />
          <Wheel position={[-1.12, 0.34, -0.9]} sport={sport} />
          <Wheel position={[1.42, 0.34, 0]} sport={sport} />

          {/* Tail light bar */}
          <Emissive args={[0.08, 0.07, 0.92]} position={[2.08, 0.78, 0]} color={accent} />
        </group>
      </Float>
    </group>
  );
}

/* ----------------------------------------------------------- Story rig */

/** Camera stops for the scroll story, one per chapter. The car faces -X. */
export const STORY_SHOTS: { pos: Vec3; look: Vec3 }[] = [
  { pos: [-6.2, 2.3, 6.6], look: [0, 0.45, 0] }, // three-quarter hero
  { pos: [-7.0, 1.15, 1.4], look: [-1.4, 0.5, 0.2] }, // the face: spine + turbines
  { pos: [0.6, 5.0, 7.2], look: [0, 0.9, 0] }, // gullwings, from above
  { pos: [0.3, 0.75, 9.4], look: [0, 0.45, 0] }, // low profile: three wheels
  { pos: [6.2, 2.4, 4.6], look: [0, 0.5, 0] }, // rear three-quarter
];

function CameraRig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const look = useRef(new THREE.Vector3(...STORY_SHOTS[0].look));
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), p: new THREE.Vector3(), l: new THREE.Vector3() }), []);
  const { camera, size } = useThree();

  // Desktop: render the car right of centre so the chapter copy on the left stays clear.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (size.width >= 768) cam.setViewOffset(size.width, size.height, -size.width * 0.16, 0, size.width, size.height);
    else cam.clearViewOffset();
    return () => cam.clearViewOffset();
  }, [camera, size.width, size.height]);

  useFrame((state, delta) => {
    const last = STORY_SHOTS.length - 1;
    const x = THREE.MathUtils.clamp(progressRef.current, 0, 1) * last;
    const i = Math.min(Math.floor(x), last - 1);
    const t = THREE.MathUtils.smootherstep(x - i, 0, 1);
    v.p.lerpVectors(v.a.fromArray(STORY_SHOTS[i].pos), v.b.fromArray(STORY_SHOTS[i + 1].pos), t);
    v.l.lerpVectors(v.a.fromArray(STORY_SHOTS[i].look), v.b.fromArray(STORY_SHOTS[i + 1].look), t);
    if (size.width < size.height) {
      // Portrait phones: back the camera off and aim low so the car sits above the copy.
      v.p.sub(v.l).multiplyScalar(1.9).add(v.l);
      v.l.y -= 1.1;
    }
    const k = 1 - Math.exp(-5 * delta);
    state.camera.position.lerp(v.p, k);
    look.current.lerp(v.l, k);
    state.camera.lookAt(look.current);
  });

  return null;
}

/* --------------------------------------------------------------- Studio */

function Studio({
  color,
  accent,
  preset,
  interactive,
  sport,
  animate,
  doorsOpen,
  progressRef,
}: Required<Pick<BricklinSceneProps, 'color' | 'accent' | 'preset' | 'interactive' | 'sport' | 'doorsOpen'>> & {
  animate: boolean;
  progressRef?: MutableRefObject<number>;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const wide = useThree((s) => s.size.width >= 1024);
  const portrait = useThree((s) => s.size.width < s.size.height);
  // On wide hero layouts, slide the car to screen-right so it clears the headline.
  const offset: Vec3 = preset === 'hero' && wide ? [1.9, 0, 1.2] : [0, 0, 0];
  useFrame((state) => {
    if (ring.current && animate) {
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
    }
  });

  return (
    <>
      <color attach="background" args={['#06070a']} />
      <fog attach="fog" args={['#06070a', portrait ? 16 : 9, portrait ? 34 : 18]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[-4, 6, 5]} intensity={60} angle={0.42} penumbra={0.8} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[4, 2.5, -4]} intensity={40} angle={0.6} penumbra={1} color={accent} />
      <pointLight position={[-3.5, 0.6, -2]} intensity={6} color="#3fa9ff" />

      {/* Studio light panels: give the clear-coat something to reflect (no network fetch). */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={6} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={4} position={[-5, 1.5, 2]} rotation-y={Math.PI / 2} scale={[10, 1.5, 1]} />
        <Lightformer form="rect" intensity={3} position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[10, 1.5, 1]} />
        <Lightformer form="rect" intensity={3} position={[0, 2, 6]} scale={[8, 2, 1]} />
        <Lightformer form="ring" color={accent} intensity={4} position={[0, 2, -6]} scale={3} />
      </Environment>

      <Sparkles count={preset === 'hero' ? 40 : 16} scale={[9, 3, 6]} size={1.4} speed={animate ? 0.16 : 0} color="#ffffff" opacity={0.25} />
      <group position={offset}>
        <Vehicle color={color} accent={accent} interactive={interactive} sport={sport} animate={animate} doorsOpen={doorsOpen} />

        {/* Glowing turntable ring */}
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.565, 0]}>
          <ringGeometry args={[2.55, 2.6, 128]} />
          <meshBasicMaterial color={accent} transparent opacity={0.35} toneMapped={false} />
        </mesh>
        <ContactShadows position={[0, -0.57, 0]} opacity={0.75} scale={7} blur={2.4} far={4} color="#000000" />
      </group>

      {/* Glossy showroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={6}
          roughness={0.85}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#07080c"
          metalness={0.6}
          mirror={0}
        />
      </mesh>

      {progressRef && <CameraRig progressRef={progressRef} />}

      {interactive && !progressRef && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={preset !== 'hero'}
          minDistance={4.6}
          maxDistance={preset === 'hero' ? 22 : 8}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={preset === 'hero' ? -Math.PI / 2.4 : -Infinity}
          maxAzimuthAngle={preset === 'hero' ? Math.PI / 2.4 : Infinity}
          autoRotate={animate && preset !== 'hero'}
          autoRotateSpeed={0.5}
          target={[0, 0.5, 0]}
        />
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Scene */

export function BricklinScene({
  color = PEARL,
  accent = '#e11d2e',
  preset = 'hero',
  interactive = true,
  className = '',
  sport = false,
  doorsOpen = false,
  progressRef,
}: BricklinSceneProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebgl(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      setWebgl(false);
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener('change', updateMotion);

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '160px 0px', threshold: 0.01 },
    );
    if (stage.current) observer.observe(stage.current);

    return () => {
      motion.removeEventListener('change', updateMotion);
      observer.disconnect();
    };
  }, []);

  if (webgl === false) {
    return (
      <div className={`flex items-center justify-center bg-[#06070a] ${className}`}>
        <BricklinCar id={`fallback-${preset}`} body={color} accent={accent} className="w-[92%]" />
      </div>
    );
  }

  const camera = progressRef
    ? { position: STORY_SHOTS[0].pos, fov: 32 }
    : preset === 'configurator'
      ? { position: [-5.6, 2.3, 6.4] as Vec3, fov: 34 }
      : preset === 'detail'
        ? { position: [-5.8, 2.1, 6.4] as Vec3, fov: 32 }
        : { position: [-6.1, 2.6, 9.6] as Vec3, fov: 33 };

  return (
    <div ref={stage} className={`relative bg-[#06070a] ${className}`} aria-label="Interactive 3D model of the Bricklin 3EV">
      {webgl === null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-brand" />
        </div>
      )}
      <Canvas
        shadows
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={camera}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <Studio
            color={color}
            accent={accent}
            preset={preset}
            interactive={interactive}
            sport={sport}
            animate={!reducedMotion}
            doorsOpen={doorsOpen}
            progressRef={progressRef}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent" />
    </div>
  );
}
