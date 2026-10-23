import { useGLTF } from '@react-three/drei';
import { useLayoutEffect } from 'react';
import { MODEL_URL } from './palette';

/** Skala yang membuat pasangan setinggi ±1,8 unit scene (model asli ±3,1 unit). */
const SCALE = 0.58;

/**
 * GLB prototipe: statis (tanpa rig/animasi), sumbu Z ke atas, wajah menghadap -Y.
 * Diputar -90° pada X agar tegak (Y ke atas) dan menghadap kamera; proporsi & material tidak diubah.
 */
export function Couple() {
    const { scene } = useGLTF(MODEL_URL);

    useLayoutEffect(() => {
        scene.traverse((o) => {
            if ('isMesh' in o) o.castShadow = true;
        });
    }, [scene]);

    // Model berpusat di x≈-0.09 dengan alas di z=0; offset kecil memusatkannya pada jalur.
    return (
        <group rotation={[-Math.PI / 2, 0, 0]} scale={SCALE} position={[0.05, 0.02, 0]}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(MODEL_URL);
