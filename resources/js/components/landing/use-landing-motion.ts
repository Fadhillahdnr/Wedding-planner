import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type RefObject, useEffect, useLayoutEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface Refs {
    root: RefObject<HTMLDivElement | null>;
    frame: RefObject<HTMLDivElement | null>;
}

/**
 * Koreografi scroll (teknik diadaptasi dari Aanaya-web/WelcomeExperience.js):
 * - satu ScrollTrigger ber-scrub pada wrapper tinggi + stage sticky, bukan scroll hijacking;
 * - reveal sekali jalan (`start: 'top 88%'`, `once`) untuk elemen kecil;
 * - ScrollTrigger.refresh setelah font siap; semua dibersihkan lewat gsap.context().
 * Reduced motion: tidak ada animasi sama sekali (tata letak statis lewat varian `motion-reduce:` di CSS).
 */
export function useLandingMotion({ root, frame }: Refs) {
    useLayoutEffect(() => {
        const scope = root.current;
        if (!scope) return;

        const mm = gsap.matchMedia();
        const ctx = gsap.context(() => {
            mm.add(
                {
                    wide: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
                    narrow: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
                },
                (context) => {
                    const wide = !!context.conditions?.wide;
                    const q = gsap.utils.selector(scope);

                    // Bilah progres halaman.
                    gsap.to(q('[data-progress]'), {
                        scaleX: 1,
                        ease: 'none',
                        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
                    });

                    // Navigasi menjadi solid setelah meninggalkan adegan pembuka.
                    ScrollTrigger.create({
                        start: 60,
                        end: 'max',
                        toggleClass: { targets: q('[data-nav]'), className: 'is-solid' },
                    });

                    // Adegan 1-3: satu timeline ber-scrub di atas stage sticky.
                    const tl = gsap.timeline({
                        defaults: { ease: 'none' },
                        scrollTrigger: { trigger: q('[data-story]')[0], start: 'top top', end: 'bottom bottom', scrub: 0.7 },
                    });

                    tl.to(q('[data-copy="hero"]'), { yPercent: -14, autoAlpha: 0, duration: 0.18 }, 0.06)
                        .to(q('[data-scroll-hint]'), { autoAlpha: 0, duration: 0.06 }, 0)
                        .fromTo(
                            q('[data-copy="dream"]'),
                            { yPercent: 12, autoAlpha: 0, filter: 'blur(6px)' },
                            { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.16 },
                            0.24,
                        )
                        .to(q('[data-copy="dream"]'), { yPercent: -10, autoAlpha: 0, duration: 0.14 }, 0.56)
                        .to(frame.current, { scale: wide ? 1.12 : 1.06, duration: 0.7 }, 0)
                        .fromTo(q('[data-copy="world"]'), { yPercent: 14, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.14 }, 0.8);

                    if (wide) {
                        // Adegan 3: video menyusut menjadi jendela berbingkai di atas latar gading.
                        tl.fromTo(
                            q('[data-window]'),
                            { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
                            { clipPath: 'inset(7% 9% 7% 9% round 32px)', duration: 0.3 },
                            0.7,
                        ).fromTo(q('[data-veil]'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);
                    }

                    // Parallax dekorasi: kecepatan berbeda per kedalaman.
                    q('[data-depth]').forEach((el) => {
                        const depth = Number((el as HTMLElement).dataset.depth ?? 0.1);
                        gsap.to(el, {
                            yPercent: -60 * depth,
                            ease: 'none',
                            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
                        });
                    });

                    // Garis perjalanan perencanaan terisi mengikuti scroll.
                    gsap.fromTo(
                        q('[data-journey-line]'),
                        { scaleY: 0 },
                        {
                            scaleY: 1,
                            ease: 'none',
                            scrollTrigger: { trigger: q('[data-journey]')[0], start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
                        },
                    );

                    // Reveal kecil sekali jalan.
                    q('[data-reveal]').forEach((el) => {
                        gsap.from(el, {
                            opacity: 0,
                            y: 24,
                            duration: 0.7,
                            ease: 'power2.out',
                            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                        });
                    });

                    // Kata-kata judul muncul bertahap, blur → jelas.
                    q('[data-words]').forEach((el) => {
                        gsap.from(el.querySelectorAll('[data-word]'), {
                            opacity: 0.15,
                            filter: 'blur(4px)',
                            stagger: 0.08,
                            ease: 'none',
                            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
                        });
                    });
                },
            );
        }, scope);

        const refresh = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refresh).catch(() => {});
        window.addEventListener('load', refresh, { once: true });

        return () => {
            window.removeEventListener('load', refresh);
            mm.revert();
            ctx.revert();
        };
    }, [root, frame]);
}

/**
 * Scrub video: `currentTime` mengikuti progres scroll di section cerita.
 * Dihaluskan per frame lewat ticker GSAP (tidak mencari pada setiap event scroll) dan tidak mencari
 * saat seek sebelumnya belum selesai. Bila seek rata-rata lambat, `onSlow` mengalihkan ke mode loop.
 */
export function useVideoScrub(video: RefObject<HTMLVideoElement | null>, story: RefObject<HTMLElement | null>, enabled: boolean, onSlow: () => void) {
    useEffect(() => {
        const el = video.current;
        const section = story.current;
        if (!enabled || !el || !section) return;

        let duration = 0;
        let target = 0;
        let current = 0;
        let seekStart = 0;
        const seekTimes: number[] = [];

        const onMeta = () => {
            duration = el.duration || 0;
        };
        const onSeeked = () => {
            if (!seekStart) return;
            seekTimes.push(performance.now() - seekStart);
            seekStart = 0;
            if (seekTimes.length >= 24) {
                const average = seekTimes.reduce((a, b) => a + b, 0) / seekTimes.length;
                seekTimes.length = 0;
                if (average > 220) onSlow();
            }
        };

        if (el.readyState >= 1) onMeta();
        el.addEventListener('loadedmetadata', onMeta);
        el.addEventListener('seeked', onSeeked);
        el.pause();

        const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                target = self.progress * Math.max(0, duration - 0.05);
            },
        });

        const tick = () => {
            if (!duration) return;
            current += (target - current) * 0.18;
            if (Math.abs(target - current) < 0.005) current = target;
            if (!el.seeking && Math.abs(el.currentTime - current) > 0.01) {
                seekStart = performance.now();
                el.currentTime = current;
            }
        };
        gsap.ticker.add(tick);

        return () => {
            gsap.ticker.remove(tick);
            trigger.kill();
            el.removeEventListener('loadedmetadata', onMeta);
            el.removeEventListener('seeked', onSeeked);
        };
    }, [video, story, enabled, onSlow]);
}
