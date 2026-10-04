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
    <group position={[-2.09, 0.68, z]}>
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

/* ------------------------------------------------------------ Geometry */
// All profiles are side views (x = length, front at -x; y = height), extruded across the width (z).

/** Lower body. Drawn 0.14 inside the final outline; the bevel rounds it back out. */
function makeBodyGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-1.82, 0.48);
  s.quadraticCurveTo(-1.98, 0.5, -1.98, 0.66);
  s.lineTo(-1.97, 0.76);
  s.quadraticCurveTo(-1.95, 0.86, -1.76, 0.87);
  s.lineTo(-0.9, 0.9);
  s.lineTo(1.3, 0.88);
  s.quadraticCurveTo(1.95, 0.86, 2.04, 0.72);
  s.quadraticCurveTo(2.08, 0.54, 1.85, 0.5);
  s.lineTo(-1.82, 0.48);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 1.3,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.14,
    bevelSegments: 10,
    curveSegments: 40,
  });
  g.translate(0, 0, -0.65);
  g.computeVertexNormals();
  return g;
}

/** Greenhouse roofline: windshield → roof → fastback. */
function makeRoofCurve() {
  const path = new THREE.CurvePath<THREE.Vector2>();
  path.add(new THREE.CubicBezierCurve(new THREE.Vector2(-0.85, 1.03), new THREE.Vector2(-0.55, 1.14), new THREE.Vector2(-0.3, 1.43), new THREE.Vector2(-0.05, 1.46)));
  path.add(new THREE.LineCurve(new THREE.Vector2(-0.05, 1.46), new THREE.Vector2(0.6, 1.48)));
  path.add(new THREE.CubicBezierCurve(new THREE.Vector2(0.6, 1.48), new THREE.Vector2(1.05, 1.47), new THREE.Vector2(1.5, 1.16), new THREE.Vector2(1.78, 1.01)));
  return path.getSpacedPoints(64);
}

/** Thin curved shell following the roofline, `width` wide, centred on z = 0. */
function makeShellGeometry(points: THREE.Vector2[], thickness: number, width: number, lift = 0) {
  const outer = points.map((p) => new THREE.Vector2(p.x, p.y + lift));
  const inner = outer.map((p) => new THREE.Vector2(p.x, p.y - thickness)).reverse();
  const g = new THREE.ExtrudeGeometry(new THREE.Shape([...outer, ...inner]), {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  g.translate(0, 0, -width / 2);
  g.computeVertexNormals();
  return g;
}

const HINGE_Y = 1.46;
const CABIN_HALF = 0.5;

/** Side-window door panel, origin moved to the roof hinge line. */
function makeDoorGeometry(points: THREE.Vector2[]) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(points.map((p) => p.clone())), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  g.translate(0, -HINGE_Y, -0.015);
  return g;
}

/** Gullwing door hinged on the roof edge. side = 1 (right / +z) or -1 (left / -z). */
function GullwingDoor({ side, open, geometry }: { side: 1 | -1; open: boolean; geometry: THREE.BufferGeometry }) {
  const hinge = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!hinge.current) return;
    const target = open ? -2.35 * side : 0;
    hinge.current.rotation.x = THREE.MathUtils.damp(hinge.current.rotation.x, target, 2.6, delta);
  });

  return (
    <group ref={hinge} position={[0, HINGE_Y, CABIN_HALF * side]}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial color="#0c141f" roughness={0.04} metalness={0.2} clearcoat={1} transparent opacity={0.72} />
      </mesh>
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
        metalness: 0.25,
        roughness: 0.14,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        sheen: 0.4,
        sheenColor: new THREE.Color('#ffffff'),
      }),
    [color],
  );
  const stripe = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#fbfcfd', roughness: 0.1, metalness: 0.15, clearcoat: 1 }),
    [],
  );
  const black = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#07090d', roughness: 0.32, metalness: 0.7 }),
    [],
  );
  const geo = useMemo(() => {
    const roof = makeRoofCurve();
    return {
      body: makeBodyGeometry(),
      glass: makeShellGeometry(roof, 0.045, CABIN_HALF * 2),
      spine: makeShellGeometry(roof, 0.03, 0.24, 0.018),
      door: makeDoorGeometry(roof),
    };
  }, []);

  useEffect(() => () => paint.dispose(), [paint]);
  useEffect(
    () => () => {
      stripe.dispose();
      black.dispose();
      Object.values(geo).forEach((g) => g.dispose());
    },
    [stripe, black, geo],
  );

  useFrame((state, delta) => {
    if (!group.current || !interactive || !animate) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, 0.15 + state.pointer.x * 0.16, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.04, 4, delta);
  });

  // The car faces -X. Width runs along Z.
  return (
    <group ref={group} rotation={[0, 0.15, 0]} position={[0, -0.2, 0]}>
      <Float speed={animate ? 1.1 : 0} rotationIntensity={animate ? 0.03 : 0} floatIntensity={animate ? 0.07 : 0}>
        <group scale={0.88} position={[0, -0.06, 0]}>
          {/* ---- Body ---- */}
          <mesh geometry={geo.body} material={paint} castShadow receiveShadow />
          <RoundedBox args={[3.9, 0.1, 1.6]} radius={0.04} smoothness={3} position={[0.05, 0.36, 0]} material={black} castShadow />

          {/* ---- Greenhouse: glass shell, white spine, cabin floor ---- */}
          <mesh geometry={geo.glass} castShadow>
            <meshPhysicalMaterial color="#0b121c" roughness={0.03} metalness={0.35} clearcoat={1} transparent opacity={0.82} />
          </mesh>
          <mesh geometry={geo.spine} material={stripe} />
          <RoundedBox args={[1.25, 0.025, 0.24]} radius={0.012} smoothness={2} position={[-1.48, 1.045, 0]} material={stripe} />
          <RoundedBox args={[2.6, 0.02, CABIN_HALF * 2]} radius={0.01} smoothness={2} position={[0.45, 1.05, 0]}>
            <meshStandardMaterial color="#14171c" roughness={0.8} />
          </RoundedBox>

          {/* ---- Interior: two seats, dash, wheel ---- */}
          {[0.24, -0.24].map((z) => (
            <group key={z} position={[0.35, 1.06, z]}>
              <RoundedBox args={[0.42, 0.1, 0.36]} radius={0.04} smoothness={3} position={[0, 0.05, 0]}>
                <meshStandardMaterial color="#26201c" roughness={0.65} />
              </RoundedBox>
              <RoundedBox args={[0.1, 0.4, 0.36]} radius={0.04} smoothness={3} position={[0.2, 0.22, 0]} rotation={[0, 0, -0.25]}>
                <meshStandardMaterial color="#26201c" roughness={0.65} />
              </RoundedBox>
            </group>
          ))}
          <RoundedBox args={[0.3, 0.1, CABIN_HALF * 1.8]} radius={0.04} smoothness={3} position={[-0.62, 1.12, 0]}>
            <meshStandardMaterial color="#111318" roughness={0.5} />
          </RoundedBox>
          <mesh position={[-0.42, 1.2, 0.24]} rotation={[0, Math.PI / 2, 0.35]}>
            <torusGeometry args={[0.09, 0.015, 8, 28]} />
            <meshStandardMaterial color="#0b0c0f" roughness={0.4} />
          </mesh>

          <GullwingDoor side={1} open={doorsOpen} geometry={geo.door} />
          <GullwingDoor side={-1} open={doorsOpen} geometry={geo.door} />

          {/* ---- Signature front: centre spine, turbine intakes, LED brackets ---- */}
          <RoundedBox args={[0.06, 0.58, 0.24]} radius={0.028} smoothness={3} position={[-2.125, 0.7, 0]} material={stripe} />
          {[1, -1].map((s) => (
            <RoundedBox key={s} args={[0.05, 0.56, 0.03]} radius={0.012} smoothness={2} position={[-2.12, 0.7, 0.135 * s]} material={black} />
          ))}
          <TurbineIntake z={0.47} animate={animate} />
          <TurbineIntake z={-0.47} animate={animate} />
          {[1, -1].map((s) => (
            <group key={s}>
              <Emissive args={[0.04, 0.44, 0.045]} position={[-2.09, 0.7, 0.79 * s]} rotation={[0.1 * s, 0, 0]} color="#f4f9ff" />
              <Emissive args={[0.04, 0.045, 0.18]} position={[-2.08, 0.93, 0.71 * s]} color="#f4f9ff" />
              <Emissive args={[0.04, 0.045, 0.12]} position={[-2.08, 0.47, 0.74 * s]} color="#f4f9ff" />
            </group>
          ))}
          <RoundedBox args={[0.36, 0.06, 1.5]} radius={0.025} smoothness={3} position={[-1.98, 0.32, 0]} material={black} />

          {/* Side intakes */}
          {[1, -1].map((s) => (
            <RoundedBox key={s} args={[0.7, 0.15, 0.03]} radius={0.05} smoothness={3} position={[0.95, 0.68, 0.81 * s]} material={black} />
          ))}

          {/* ---- Wheels: two front at the corners with arch trims, one rear ---- */}
          {[1, -1].map((s) => (
            <group key={s}>
              <Wheel position={[-1.38, 0.34, 0.93 * s]} sport={sport} />
              <mesh position={[-1.38, 0.34, 0.93 * s]} material={paint}>
                <torusGeometry args={[0.52, 0.045, 10, 40, Math.PI]} />
              </mesh>
            </group>
          ))}
          <Wheel position={[1.55, 0.34, 0]} sport={sport} />

          {/* Tail light bar */}
          <Emissive args={[0.05, 0.06, 1.1]} position={[2.2, 0.82, 0]} color={accent} />
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
        : { position: [-5.5, 2.4, 8.7] as Vec3, fov: 33 };

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
