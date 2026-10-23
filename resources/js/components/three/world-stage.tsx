import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Component, type ReactNode, Suspense, lazy, useEffect, useState } from 'react';
import { StaticWorld } from './static-world';

const WorldCanvas = lazy(() => import('./world-canvas'));

const PREF_KEY = 'world3d';

function webglAvailable(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

/** Perangkat yang jelas lemah dianggap "hemat daya": tanpa bayangan, resolusi 1x. */
function isLowPower(): boolean {
    const nav = navigator as Navigator & { deviceMemory?: number };
    return (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2;
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        console.error('Dunia 3D gagal dimuat:', error);
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

export interface WorldLink {
    href: string;
    label: string;
}

interface Props {
    interactive?: boolean;
    /** Tautan navigasi setara untuk benda-benda di scene (tidak bergantung pada 3D). */
    links?: WorldLink[];
    className?: string;
}

type Mode = 'checking' | '3d' | 'static';

export function WorldStage({ interactive = true, links = [], className }: Props) {
    const [mode, setMode] = useState<Mode>('checking');
    const [reducedMotion, setReducedMotion] = useState(false);
    const [lowPower, setLowPower] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(media.matches);
        const onChange = () => setReducedMotion(media.matches);
        media.addEventListener('change', onChange);

        let saved: string | null = null;
        try {
            saved = localStorage.getItem(PREF_KEY);
        } catch {
            // Penyimpanan diblokir: abaikan preferensi tersimpan.
        }
        setLowPower(isLowPower());
        setMode(saved === 'off' || !webglAvailable() ? 'static' : '3d');

        return () => media.removeEventListener('change', onChange);
    }, []);

    const choose = (next: Mode) => {
        setMode(next);
        try {
            localStorage.setItem(PREF_KEY, next === '3d' ? 'on' : 'off');
        } catch {
            // Tidak apa-apa bila tidak tersimpan.
        }
    };

    const fallback = (
        <div className="size-full p-4">
            <StaticWorld />
        </div>
    );

    return (
        <div className={className}>
            <div className="bg-mint relative aspect-[4/3] w-full overflow-hidden rounded-md sm:aspect-[5/4] lg:aspect-[6/5]">
                {mode === 'checking' && <div className="size-full" aria-hidden="true" />}
                {mode === 'static' && fallback}
                {mode === '3d' && (
                    <Boundary fallback={fallback}>
                        <div className="size-full" role="img" aria-label="Dunia mungil kita: sepasang karakter chibi di bawah lengkungan bunga">
                            <Suspense fallback={<p className="text-plum grid size-full place-items-center text-sm">Menyiapkan dunia kita…</p>}>
                                <WorldCanvas interactive={interactive} reducedMotion={reducedMotion} lowPower={lowPower} />
                            </Suspense>
                        </div>
                    </Boundary>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                {interactive && links.length > 0 && (
                    <nav aria-label="Pintasan dunia kita">
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {links.map((l) => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
                {mode !== 'checking' && (
                    <Button type="button" variant="ghost" size="sm" className="h-11" onClick={() => choose(mode === '3d' ? 'static' : '3d')}>
                        {mode === '3d' ? 'Pakai ilustrasi statis' : 'Tampilkan dunia 3D'}
                    </Button>
                )}
            </div>
        </div>
    );
}
