import { router } from '@inertiajs/react';
import { Html, useCursor } from '@react-three/drei';
import { type ReactNode, useMemo, useState } from 'react';
import * as THREE from 'three';
import { palette } from './palette';

interface HotspotProps {
    href: string;
    label: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    labelY?: number;
    interactive: boolean;
    children: ReactNode;
}

/** Benda yang bisa diklik: membesar sedikit saat disorot dan membuka halaman yang sebenarnya. */
export function Hotspot({ href, label, position, rotation, labelY = 1.4, interactive, children }: HotspotProps) {
    const [hovered, setHovered] = useState(false);
    useCursor(interactive && hovered);

    if (!interactive) {
        return (
            <group position={position} rotation={rotation}>
                {children}
            </group>
        );
    }

    return (
        <group
            position={position}
            rotation={rotation}
            scale={hovered ? 1.07 : 1}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                router.visit(href);
            }}
        >
            {children}
            {hovered && (
                <Html center position={[0, labelY, 0]} style={{ pointerEvents: 'none' }}>
                    <span className="bg-ivory text-plum rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-sm">{label}</span>
                </Html>
            )}
        </group>
    );
}

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => (
    <meshStandardMaterial color={color} roughness={0.85} {...extra} />
);

/** Lengkungan bunga → Timeline. */
export function Arch({ interactive }: { interactive: boolean }) {
    const flowers = useMemo(
        () =>
            Array.from({ length: 13 }, (_, i) => {
                const a = (i / 12) * Math.PI;
                return {
                    x: Math.cos(a) * 1.5,
                    y: 1.75 + Math.sin(a) * 1.5,
                    c: i % 3 === 0 ? palette.coral : i % 3 === 1 ? palette.blush : palette.ivory,
                };
            }),
        [],
    );

    return (
        <Hotspot href="/timeline" label="Timeline" position={[0, 0, -1.2]} labelY={3.7} interactive={interactive}>
            <mesh position={[-1.5, 0.88, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 1.76, 16]} />
                {std(palette.ivory)}
            </mesh>
            <mesh position={[1.5, 0.88, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 1.76, 16]} />
                {std(palette.ivory)}
            </mesh>
            <mesh position={[0, 1.75, 0]} castShadow>
                <torusGeometry args={[1.5, 0.09, 12, 56, Math.PI]} />
                {std(palette.ivory)}
            </mesh>
            {flowers.map((f, i) => (
                <mesh key={i} position={[f.x, f.y, 0.04]} castShadow>
                    <icosahedronGeometry args={[0.16, 1]} />
                    {std(f.c)}
                </mesh>
            ))}
        </Hotspot>
    );
}

/** Kalender papan → tambah tugas. */
export function Calendar({ interactive }: { interactive: boolean }) {
    const cells = useMemo(
        () => Array.from({ length: 12 }, (_, i) => ({ x: (i % 4) * 0.17 - 0.255, y: 0.12 - Math.floor(i / 4) * 0.17, hi: i === 5 })),
        [],
    );

    return (
        <Hotspot href="/timeline#tambah" label="Tugas" position={[-2.7, 0, 0.1]} rotation={[0, 0.45, 0]} labelY={1.7} interactive={interactive}>
            <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 0.8, 10]} />
                {std(palette.plum)}
            </mesh>
            <group position={[0, 1.05, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.8, 0.85, 0.06]} />
                    {std(palette.ivory)}
                </mesh>
                <mesh position={[0, 0.33, 0.04]}>
                    <boxGeometry args={[0.8, 0.2, 0.03]} />
                    {std(palette.coral)}
                </mesh>
                {cells.map((c, i) => (
                    <mesh key={i} position={[c.x, c.y, 0.04]}>
                        <boxGeometry args={[0.12, 0.12, 0.02]} />
                        {std(c.hi ? palette.coral : palette.aqua)}
                    </mesh>
                ))}
            </group>
        </Hotspot>
    );
}

const heartShape = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.bezierCurveTo(-0.9, 0.1, -0.5, 0.75, 0, 0.3);
    s.bezierCurveTo(0.5, 0.75, 0.9, 0.1, 0, -0.5);
    return s;
})();

export function Heart({ color = palette.coral, scale = 0.2 }: { color?: string; scale?: number }) {
    return (
        <mesh scale={scale}>
            <extrudeGeometry args={[heartShape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }]} />
            {std(color)}
        </mesh>
    );
}

/** Bingkai foto → Kenangan. */
export function PhotoFrame({ interactive }: { interactive: boolean }) {
    return (
        <Hotspot href="/kenangan" label="Kenangan" position={[3.0, 0, -0.5]} rotation={[0, -0.45, 0]} labelY={1.75} interactive={interactive}>
            <mesh position={[0, 0.4, -0.02]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 0.8, 10]} />
                {std(palette.plum)}
            </mesh>
            <group position={[0, 1.05, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.85, 0.7, 0.08]} />
                    {std(palette.plum)}
                </mesh>
                <mesh position={[0, 0, 0.05]}>
                    <boxGeometry args={[0.7, 0.55, 0.02]} />
                    {std(palette.aqua)}
                </mesh>
                <group position={[0, 0, 0.07]}>
                    <Heart color={palette.coral} scale={0.22} />
                </group>
            </group>
        </Hotspot>
    );
}

/** Kotak tabungan → Anggaran. */
export function SavingsBox({ interactive }: { interactive: boolean }) {
    return (
        <Hotspot href="/anggaran" label="Anggaran" position={[-1.9, 0, 1.35]} rotation={[0, 0.3, 0]} labelY={1.1} interactive={interactive}>
            <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.6, 0.4, 0.4]} />
                {std(palette.blush)}
            </mesh>
            <mesh position={[0, 0.41, 0]}>
                <boxGeometry args={[0.3, 0.02, 0.05]} />
                {std(palette.plum)}
            </mesh>
            {[0, 1, 2].map((i) => (
                <mesh key={i} position={[0.5, 0.04 + i * 0.07, 0.05]} castShadow>
                    <cylinderGeometry args={[0.15, 0.15, 0.06, 20]} />
                    {std(palette.coral)}
                </mesh>
            ))}
        </Hotspot>
    );
}

/** Kotak surat → Catatan. */
export function Letterbox({ interactive }: { interactive: boolean }) {
    return (
        <Hotspot href="/catatan" label="Catatan" position={[2.0, 0, 1.9]} rotation={[0, -0.3, 0]} labelY={1.65} interactive={interactive}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 1, 10]} />
                {std(palette.plum)}
            </mesh>
            <mesh position={[0, 1.12, 0]} castShadow>
                <boxGeometry args={[0.56, 0.36, 0.38]} />
                {std(palette.ivory)}
            </mesh>
            <mesh position={[0, 1.3, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.6, 0.04, 0.42]} />
                {std(palette.coral)}
            </mesh>
            <mesh position={[0.32, 1.28, 0]} castShadow>
                <boxGeometry args={[0.03, 0.22, 0.1]} />
                {std(palette.coral)}
            </mesh>
        </Hotspot>
    );
}

/** Lentera kecil yang menyala lembut (emissive, tanpa cahaya tambahan agar murah). */
export function Lantern({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.025, 0.03, 1.4, 8]} />
                {std(palette.plum)}
            </mesh>
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.16, 16, 12]} />
                <meshStandardMaterial color={palette.ivory} emissive={palette.blush} emissiveIntensity={0.9} roughness={0.5} />
            </mesh>
        </group>
    );
}
