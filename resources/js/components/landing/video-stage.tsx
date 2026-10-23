import { Pause, Play } from 'lucide-react';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export const SCRUB_SRC = '/video/our-little-world-scrub.mp4';
export const LOOP_SRC = '/video/our-little-world.mp4';
export const POSTER_SRC = '/videos/our-little-world-poster.jpg';

/**
 * - scrub: salinan all-intra (setiap frame keyframe, tanpa audio); `currentTime` mengikuti progres scroll.
 * - loop:  video asli diputar berulang (fallback bila seek lambat, hemat data, atau berkas scrub gagal).
 * - still: hanya poster (reduced motion).
 * Satu mode aktif pada satu waktu, jadi loop tidak pernah berebut dengan scrub.
 */
export type VideoMode = 'scrub' | 'loop' | 'still';

export function useVideoPlayback(reducedMotion: boolean) {
    const video = useRef<HTMLVideoElement>(null);
    const [mode, setMode] = useState<VideoMode>('scrub');
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (reducedMotion) setMode('still');
        else if (connection?.saveData) setMode('loop');
        else setMode((m) => (m === 'still' ? 'scrub' : m));
    }, [reducedMotion]);

    useEffect(() => {
        if (mode !== 'loop') return;
        video.current?.play().catch(() => {});
    }, [mode]);

    const toggle = useCallback(() => {
        const el = video.current;
        if (!el) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
    }, []);

    return { video, mode, setMode, playing, failed, toggle, setPlaying, setFailed };
}

type Playback = ReturnType<typeof useVideoPlayback>;

interface StageProps {
    /** Wadah yang menerima transform scroll (skala); dipegang oleh hook animasi. */
    frameRef: RefObject<HTMLDivElement | null>;
    playback: Playback;
}

export function VideoStage({ frameRef, playback }: StageProps) {
    const { video, mode, failed, setMode, setPlaying, setFailed } = playback;
    const src = mode === 'scrub' ? SCRUB_SRC : mode === 'loop' ? LOOP_SRC : undefined;

    return (
        <div ref={frameRef} className="from-mint to-blush/60 absolute inset-0 overflow-hidden bg-gradient-to-b will-change-transform">
            {!failed && (
                <video
                    // Remount saat mode berganti agar atribut loop/autoplay/preload diterapkan bersih.
                    key={mode}
                    ref={video}
                    className="size-full object-cover object-[50%_45%]"
                    src={src}
                    poster={POSTER_SRC}
                    muted
                    playsInline
                    loop={mode === 'loop'}
                    autoPlay={mode === 'loop'}
                    preload={mode === 'scrub' ? 'auto' : mode === 'loop' ? 'metadata' : 'none'}
                    tabIndex={-1}
                    aria-hidden="true"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => (mode === 'scrub' ? setMode('loop') : setFailed(true))}
                />
            )}
        </div>
    );
}

/** Tombol jeda hanya relevan saat video berputar sendiri (mode loop). */
export function VideoToggle({ playback }: { playback: Playback }) {
    if (playback.failed || playback.mode !== 'loop') return null;
    const Icon = playback.playing ? Pause : Play;

    return (
        <button
            type="button"
            onClick={playback.toggle}
            className="bg-ivory text-plum focus-visible:ring-coral absolute right-4 bottom-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none sm:right-8"
        >
            <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
            {playback.playing ? 'Jeda video' : 'Putar video'}
        </button>
    );
}
