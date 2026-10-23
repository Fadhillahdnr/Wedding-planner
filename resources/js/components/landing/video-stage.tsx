import { Pause, Play } from 'lucide-react';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export const VIDEO_SRC = '/videos/our-little-world.mp4';

/**
 * Strategi pemutaran: loop biasa (bukan scrub currentTime); scroll menggerakkan wadah, teks, dan lapisan sekitarnya.
 * Autoplay bisa diblokir browser, dan reduced motion tidak memutar otomatis: bingkai pertama tetap tampil dan tombol putar tersedia.
 */
export function useVideoPlayback(reducedMotion: boolean) {
    const video = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const el = video.current;
        if (!el) return;
        if (reducedMotion) {
            el.pause();
            return;
        }
        el.play().catch(() => {});
    }, [reducedMotion]);

    const toggle = useCallback(() => {
        const el = video.current;
        if (!el) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
    }, []);

    return { video, playing, failed, toggle, setPlaying, setFailed };
}

type Playback = ReturnType<typeof useVideoPlayback>;

interface StageProps {
    /** Wadah yang menerima transform scroll (skala); dipegang oleh hook animasi. */
    frameRef: RefObject<HTMLDivElement | null>;
    playback: Playback;
    reducedMotion: boolean;
}

export function VideoStage({ frameRef, playback, reducedMotion }: StageProps) {
    const { video, failed, setPlaying, setFailed } = playback;

    return (
        <div ref={frameRef} className="from-mint to-blush/60 absolute inset-0 overflow-hidden bg-gradient-to-b will-change-transform">
            {!failed && (
                <video
                    ref={video}
                    className="size-full object-cover object-[50%_45%]"
                    src={VIDEO_SRC}
                    muted
                    loop
                    playsInline
                    autoPlay={!reducedMotion}
                    preload="metadata"
                    tabIndex={-1}
                    aria-hidden="true"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => setFailed(true)}
                />
            )}
        </div>
    );
}

export function VideoToggle({ playback }: { playback: Playback }) {
    if (playback.failed) return null;
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
