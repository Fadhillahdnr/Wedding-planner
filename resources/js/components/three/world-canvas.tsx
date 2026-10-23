import { ContactShadows, Html, useProgress } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Couple } from './couple';
import { palette } from './palette';
import { Arch, Calendar, Heart, Lantern, Letterbox, PhotoFrame, SavingsBox } from './props';

export interface WorldProps {
    /** Benda dapat diklik. Mati di halaman publik karena tujuannya halaman privat. */
    interactive: boolean;
    reducedMotion: boolean;
    lowPower: boolean;
    onReady?: () => void;
}

const CAMERA_HOME = new THREE.Vector3(0, 1.9, 9.4);
const LOOK_AT = new THREE.Vector3(0, 1.15, 0);

/** Kamera bergeser sangat halus mengikuti pointer/sentuhan; mati bila reduced motion. */
function Parallax({ enabled }: { enabled: boolean }) {
    const { camera, pointer } = useThree();
    const target = useRef(new THREE.Vector3());

    useFrame((_, dt) => {
        target.current.set(CAMERA_HOME.x + (enabled ? pointer.x * 0.5 : 0), CAMERA_HOME.y + (enabled ? pointer.y * 0.18 : 0), CAMERA_HOME.z);
        camera.position.lerp(target.current, 1 - Math.exp(-dt * 3));
        camera.lookAt(LOOK_AT);
    });

    return null;
}

/** Awan dan hati melayang pelan. Tidak dirender bergerak bila reduced motion. */
function Ambient({ reducedMotion }: { reducedMotion: boolean }) {
    const clouds = useRef<THREE.Group>(null);
    const hearts = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (reducedMotion) return;
        const t = clock.elapsedTime;
        if (clouds.current) clouds.current.position.x = Math.sin(t * 0.06) * 0.8;
        hearts.current?.children.forEach((h, i) => {
            h.position.y = 3.6 + (i % 2) * 0.5 + Math.sin(t * 0.8 + i * 1.7) * 0.12;
            h.rotation.y = Math.sin(t * 0.5 + i) * 0.4;
        });
    });

    return (
        <>
            <group ref={clouds}>
                {[
                    [-3.4, 4.6, -3],
                    [3.6, 5.1, -3.6],
                    [0.4, 5.8, -4.5],
                ].map(([x, y, z], i) => (
                    <group key={i} position={[x, y, z]} scale={0.8 + i * 0.12}>
                        {[-0.5, 0, 0.55].map((dx, j) => (
                            <mesh key={j} position={[dx, j === 1 ? 0.18 : 0, 0]}>
                                <sphereGeometry args={[0.42 + (j === 1 ? 0.1 : 0), 14, 10]} />
                                <meshStandardMaterial color={palette.ivory} roughness={1} />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>
            <group ref={hearts}>
                {[
                    [-1.9, palette.coral],
                    [-0.2, palette.blush],
                    [1.8, palette.coral],
                ].map(([x, c], i) => (
                    <group key={i} position={[x as number, 3.6 + (i % 2) * 0.5, -0.6]}>
                        <Heart color={c as string} scale={0.18} />
                    </group>
                ))}
            </group>
        </>
    );
}

/** Jalur lengkung dari batu-batu pijakan gading. */
function Path() {
    const stones = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.8, 0, 3.6),
            new THREE.Vector3(-0.7, 0, 2.2),
            new THREE.Vector3(0.2, 0, 0.9),
            new THREE.Vector3(0, 0, -0.9),
        ]);
        return curve.getPoints(11);
    }, []);

    return (
        <>
            {stones.map((p, i) => (
                <mesh key={i} position={[p.x, 0.17, p.z]} receiveShadow>
                    <cylinderGeometry args={[0.3 + (i % 2) * 0.04, 0.32, 0.04, 20]} />
                    <meshStandardMaterial color={palette.ivory} roughness={0.9} />
                </mesh>
            ))}
        </>
    );
}

function Loading() {
    const { progress } = useProgress();
    return (
        <Html center>
            <span className="text-plum text-sm whitespace-nowrap">Memuat dunia kita… {Math.round(progress)}%</span>
        </Html>
    );
}

/** Pulau mungil: tanah mint, tepi aqua, rumput dengan bunga di sekelilingnya. */
function Island() {
    const blooms = useMemo(
        () =>
            Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.2;
                const r = 3.35 + (i % 4) * 0.18;
                return {
                    x: Math.cos(a) * r,
                    z: Math.sin(a) * r * 0.95,
                    c: [palette.coral, palette.blush, palette.ivory][i % 3],
                    s: 0.1 + (i % 3) * 0.03,
                };
            }),
        [],
    );

    return (
        <>
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <cylinderGeometry args={[4.1, 3.7, 0.3, 48]} />
                <meshStandardMaterial color={palette.mint} roughness={1} />
            </mesh>
            <mesh position={[0, -0.28, 0]}>
                <cylinderGeometry args={[3.7, 3.1, 0.12, 48]} />
                <meshStandardMaterial color={palette.aqua} roughness={1} />
            </mesh>
            {blooms.map((b, i) => (
                <mesh key={i} position={[b.x, 0.12 + b.s, b.z]}>
                    <icosahedronGeometry args={[b.s, 1]} />
                    <meshStandardMaterial color={b.c} roughness={0.85} />
                </mesh>
            ))}
        </>
    );
}

export default function WorldCanvas({ interactive, reducedMotion, lowPower, onReady }: WorldProps) {
    return (
        <Canvas
            // Render sekali bila reduced motion; interaksi tetap memicu render ulang lewat state React.
            frameloop={reducedMotion ? 'demand' : 'always'}
            dpr={lowPower ? 1 : [1, 1.75]}
            shadows={!lowPower}
            camera={{ position: CAMERA_HOME.toArray(), fov: 34, near: 0.1, far: 60 }}
            gl={{ antialias: !lowPower, alpha: true, powerPreference: 'default' }}
            onCreated={({ gl, camera }) => {
                camera.lookAt(LOOK_AT);
                // Tanpa tone mapping agar warna pastel tetap setia pada palet.
                gl.toneMapping = THREE.NoToneMapping;
                onReady?.();
            }}
            // pan-y: geser vertikal tetap menggulir halaman di layar sentuh.
            style={{ touchAction: 'pan-y' }}
        >
            <hemisphereLight args={[palette.ivory, palette.aqua, 1.5]} />
            <directionalLight
                position={[3.5, 6, 5]}
                intensity={1.1}
                color={palette.ivory}
                castShadow={!lowPower}
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-5}
                shadow-camera-right={5}
                shadow-camera-top={6}
                shadow-camera-bottom={-3}
            />

            <Parallax enabled={!reducedMotion} />
            <Suspense fallback={<Loading />}>
                <Island />
                <Path />
                <Couple />
                <Arch interactive={interactive} />
                <Calendar interactive={interactive} />
                <PhotoFrame interactive={interactive} />
                <SavingsBox interactive={interactive} />
                <Letterbox interactive={interactive} />
                <Lantern position={[-1.2, 0, 0.95]} />
                <Lantern position={[1.35, 0, 0.9]} />
                <Ambient reducedMotion={reducedMotion} />
                {!lowPower && (
                    <ContactShadows position={[0, 0.02, 0.2]} opacity={0.35} scale={9} blur={2.4} far={3} frames={1} color={palette.plum} />
                )}
            </Suspense>
        </Canvas>
    );
}
