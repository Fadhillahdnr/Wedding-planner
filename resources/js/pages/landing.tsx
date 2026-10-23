import { useLandingMotion } from '@/components/landing/use-landing-motion';
import { VideoStage, VideoToggle, useVideoPlayback } from '@/components/landing/video-stage';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { CalendarRange, Images, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    phases: string[];
}

const features = [
    { icon: Wallet, title: 'Anggaran kita', text: 'Ruang bersama untuk merencanakan pengeluaran dan memahami arah anggaran pernikahan.' },
    {
        icon: CalendarRange,
        title: 'Langkah menuju hari kita',
        text: 'Timeline tugas, tonggak, dan keputusan yang akan datang, bergeser mengikuti hari H.',
    },
    { icon: Images, title: 'Cerita yang ingin kita simpan', text: 'Kumpulan pribadi berisi kenangan, foto, catatan, dan momen yang berarti.' },
];

function Words({ children }: { children: string }) {
    return (
        <span data-words>
            {children.split(' ').map((w, i) => (
                <span key={i} data-word className="inline-block">
                    {w}
                    {' '}
                </span>
            ))}
        </span>
    );
}

export default function Landing({ phases }: Props) {
    const root = useRef<HTMLDivElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(media.matches);
        const on = () => setReduced(media.matches);
        media.addEventListener('change', on);
        return () => media.removeEventListener('change', on);
    }, []);

    const playback = useVideoPlayback(reduced);
    useLandingMotion({ root, frame });

    return (
        <div ref={root} className="bg-ivory text-plum min-h-screen overflow-x-clip">
            <Head title="Our Little World" />
            <a
                href="#perencanaan"
                className="bg-ivory focus:ring-coral sr-only rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:ring-2"
            >
                Lewati ke konten
            </a>

            <div aria-hidden="true" data-progress className="bg-coral fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 motion-reduce:hidden" />

            <header
                data-nav
                className="group [&.is-solid]:bg-ivory/90 fixed inset-x-0 top-0 z-40 transition-colors duration-200 [&.is-solid]:shadow-[0_1px_0_rgb(73_52_61/0.1)] [&.is-solid]:backdrop-blur-sm"
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
                    <a href="#atas" className="font-display text-lg font-medium">
                        Our Little World
                    </a>
                    <nav aria-label="Utama" className="flex items-center gap-1 sm:gap-4">
                        <a href="#cerita" className="hidden min-h-11 items-center px-2 text-sm hover:underline sm:inline-flex">
                            Cerita Kita
                        </a>
                        <a href="#perencanaan" className="hidden min-h-11 items-center px-2 text-sm hover:underline sm:inline-flex">
                            Perencanaan
                        </a>
                        <Button asChild className="h-11 px-5">
                            <Link href="/login">Masuk</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main id="atas">
                {/* Adegan 1-3: stage sticky, dikendalikan scroll (tanpa pin/penguncian scroll). */}
                <section data-story aria-labelledby="judul" className="relative h-[300svh] motion-reduce:h-auto max-md:h-[240svh]">
                    <div className="sticky top-0 h-svh overflow-hidden motion-reduce:relative motion-reduce:h-[100svh]">
                        <div data-veil className="from-mint/60 via-ivory to-ivory absolute inset-0 bg-gradient-to-b opacity-0" />

                        <div data-window className="absolute inset-x-0 top-0 h-[64svh] md:inset-0 md:h-auto">
                            <VideoStage frameRef={frame} playback={playback} reducedMotion={reduced} />
                            {/* Gradien hanya di tepi bawah/kiri untuk keterbacaan; wajah tetap bersih. */}
                            <div
                                aria-hidden="true"
                                className="from-ivory/90 via-ivory/35 pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t to-transparent md:h-[34%]"
                            />
                            <div
                                aria-hidden="true"
                                className="from-ivory/60 pointer-events-none absolute inset-y-0 left-0 hidden w-[36%] bg-gradient-to-r to-transparent md:block"
                            />
                        </div>

                        <VideoToggle playback={playback} />

                        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end px-4 pb-16 sm:px-8 md:px-[6vw] md:pb-20">
                            <div data-copy="hero" className="pointer-events-auto max-w-xl md:max-w-[min(34rem,32vw)]">
                                <p className="text-xs tracking-[0.2em] uppercase">Our Little World</p>
                                <h1 id="judul" className="mt-3 text-[clamp(2.25rem,4.4vw,4.25rem)] leading-[1.04] font-medium">
                                    Sedikit demi sedikit, menuju hari kita.
                                </h1>
                                <p className="mt-4 max-w-md text-base md:text-lg">
                                    Sebuah dunia kecil untuk merencanakan hari besar yang kita impikan bersama.
                                </p>
                                <Button asChild size="lg" className="mt-6 h-12 px-6">
                                    <Link href="/login">Mulai perjalanan kita</Link>
                                </Button>
                            </div>

                            <p data-scroll-hint className="mt-8 hidden items-center gap-3 text-sm md:flex">
                                <span aria-hidden="true" className="bg-plum/60 block h-px w-10" />
                                Scroll untuk menjelajahi cerita kita
                            </p>

                            {/* Teks adegan 2 & 3 bertumpuk di lokasi yang sama dengan teks pembuka; hanya tampil bila gerak diizinkan. */}
                            <div
                                data-copy="dream"
                                className="invisible absolute inset-x-4 bottom-16 max-w-xl motion-reduce:hidden sm:inset-x-8 md:bottom-20 md:max-w-[min(34rem,32vw)]"
                            >
                                <h2 className="text-[clamp(2rem,4.4vw,3.75rem)] leading-[1.06] font-medium">Semua dimulai dari sebuah mimpi.</h2>
                                <p className="mt-4 max-w-md text-base md:text-lg">
                                    Satu rencana kecil, lalu satu lagi, sampai dunia ini terasa nyata.
                                </p>
                            </div>
                            <div
                                data-copy="world"
                                className="invisible absolute inset-x-4 bottom-10 text-center motion-reduce:hidden sm:inset-x-8 md:bottom-[2.2%]"
                            >
                                <p className="font-display text-xl md:text-2xl">Setiap sudut dunia kecil ini menyimpan satu rencana.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Adegan 4 */}
                <section id="cerita" aria-labelledby="makna" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-8 md:py-32">
                    <div
                        aria-hidden="true"
                        data-depth="0.25"
                        className="bg-blush/40 pointer-events-none absolute -top-10 right-4 size-40 rounded-full blur-2xl motion-reduce:hidden"
                    />
                    <h2 id="makna" className="max-w-3xl text-4xl leading-[1.08] font-medium sm:text-6xl">
                        <Words>Bukan sekadar merencanakan pernikahan.</Words>
                    </h2>
                    <p data-reveal className="mt-6 max-w-2xl text-lg opacity-90">
                        Tapi menyimpan setiap rencana, keputusan, dan kenangan kecil yang membawa kita lebih dekat ke hari itu.
                    </p>
                    <ul className="border-plum/15 divide-plum/15 mt-14 divide-y border-y">
                        {features.map((f, i) => (
                            <li key={f.title} data-reveal className="grid gap-3 py-8 md:grid-cols-[4rem_1fr_1.2fr] md:items-baseline md:gap-8">
                                <span
                                    className="font-display num text-coral text-3xl [-webkit-text-stroke:0.5px_var(--color-plum)]"
                                    aria-hidden="true"
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <h3 className="flex items-center gap-3 text-2xl font-medium">
                                    <f.icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                                    {f.title}
                                </h3>
                                <p className="opacity-90">{f.text}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Adegan 5 */}
                <section id="perencanaan" aria-labelledby="perjalanan" className="bg-mint/50 py-24 md:py-32">
                    <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
                        <div>
                            <p className="text-xs tracking-[0.2em] uppercase">Perjalanan persiapan</p>
                            <h2 id="perjalanan" className="mt-3 text-4xl leading-[1.08] font-medium sm:text-5xl">
                                Dari fondasi sampai minggu terakhir.
                            </h2>
                            <p data-reveal className="mt-5 max-w-md opacity-90">
                                Fase persiapan umum yang bisa diubah sesuai adat, agama, dan keluarga kalian. Tenggatnya dihitung dari hari H yang
                                kalian pilih sendiri.
                            </p>
                        </div>
                        <ol data-journey className="relative space-y-6 pl-8">
                            <span aria-hidden="true" className="bg-plum/15 absolute top-2 bottom-2 left-[7px] w-px" />
                            <span
                                aria-hidden="true"
                                data-journey-line
                                className="bg-coral absolute top-2 bottom-2 left-[6px] w-0.5 origin-top motion-reduce:scale-y-100"
                            />
                            {phases.map((name, i) => (
                                <li key={name} data-reveal className="relative">
                                    <span
                                        aria-hidden="true"
                                        className="bg-ivory border-coral absolute top-1.5 -left-8 size-3.5 rounded-full border-2"
                                    />
                                    <p className="num text-xs tracking-[0.14em] uppercase opacity-70">Fase {String(i + 1).padStart(2, '0')}</p>
                                    <p className="font-display text-xl">{name}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Adegan 6 */}
                <section aria-labelledby="ajakan" className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-8 md:py-40">
                    <div
                        aria-hidden="true"
                        data-depth="0.3"
                        className="bg-aqua/50 pointer-events-none absolute top-6 left-4 size-44 rounded-full blur-2xl motion-reduce:hidden"
                    />
                    <h2 id="ajakan" className="text-4xl leading-[1.08] font-medium sm:text-6xl">
                        <Words>Yuk, kita susun dunia kecil kita.</Words>
                    </h2>
                    <p data-reveal className="mx-auto mt-6 max-w-xl text-lg opacity-90">
                        Satu langkah kecil hari ini, satu langkah lebih dekat ke hari yang kita tunggu.
                    </p>
                    <div data-reveal className="mt-10">
                        <Button asChild size="lg" className="h-14 px-8 text-base">
                            <Link href="/login">Masuk ke Our Little World</Link>
                        </Button>
                        <p className="mt-4 text-sm opacity-80">Akses khusus untuk pasangan yang diundang.</p>
                    </div>
                </section>
            </main>

            <footer className="border-plum/15 border-t">
                <div className="mx-auto max-w-6xl px-4 py-8 text-sm opacity-80 sm:px-8">
                    Dibuat untuk dua orang. Tidak ada data pernikahan yang ditampilkan di halaman ini.
                </div>
            </footer>
        </div>
    );
}
