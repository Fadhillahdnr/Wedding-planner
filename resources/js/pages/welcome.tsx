import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { Reveal } from '@/components/site/reveal';
import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { idr } from '@/lib/format';
import { type PackageItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

interface Props {
    packages: PackageItem[];
    projects: { id: number; title: string; slug: string; category: string | null; location: string | null }[];
    faqs: { id: number; question: string; answer: string }[];
    vendorCount: number;
}

const steps = [
    ['Konsultasi', 'Kami mendengarkan visi, anggaran, dan prioritas Anda.'],
    ['Perencanaan', 'Konsep, kurasi vendor, dan jadwal disusun bersama.'],
    ['Persiapan', 'Checklist dan anggaran dipantau lewat dashboard Anda.'],
    ['Hari-H', 'Tim koordinator memastikan semuanya berjalan tenang.'],
];

export default function Welcome({ packages, projects, faqs, vendorCount }: Props) {
    const { site } = usePage<SharedData>().props;

    return (
        <SiteLayout>
            <Seo title="Perencana pernikahan yang tenang & personal" description={site.tagline} path="/" />

            <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-8 lg:grid-cols-12 lg:px-8 lg:pt-24">
                <div className="lg:col-span-6">
                    <p className="text-muted-foreground mb-5 text-xs tracking-[0.25em] uppercase">Wedding planner</p>
                    <h1 className="font-display text-5xl leading-[1.05] font-medium sm:text-6xl lg:text-7xl">
                        Hari terindah, direncanakan dengan tenang.
                    </h1>
                    <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed">{site.tagline}</p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Button asChild size="lg">
                            <Link href="/konsultasi">
                                Jadwalkan konsultasi <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/paket">Lihat paket</Link>
                        </Button>
                    </div>
                </div>
                <div className="lg:col-span-6">
                    <PhotoPlaceholder label="Foto utama (demo)" className="aspect-[4/5] w-full" />
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8" aria-labelledby="paket">
                <Reveal>
                    <h2 id="paket" className="font-display text-4xl sm:text-5xl">
                        Paket unggulan
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-xl">Harga "mulai dari" — rincian final ditentukan setelah konsultasi.</p>
                </Reveal>
                {packages.length === 0 ? (
                    <p className="text-muted-foreground mt-10 border border-dashed p-10 text-center">Paket belum tersedia.</p>
                ) : (
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {packages.map((p, i) => (
                            <Reveal key={p.id} delay={i * 0.08}>
                                <article className="bg-card flex h-full flex-col border p-7">
                                    <h3 className="font-display text-3xl">{p.name}</h3>
                                    <p className="text-muted-foreground mt-2 text-sm">{p.tagline}</p>
                                    <p className="mt-6 text-sm">
                                        Mulai dari <span className="font-display text-2xl">{idr(p.price_from)}</span>
                                    </p>
                                    <ul className="mt-6 grid flex-1 content-start gap-2 text-sm">
                                        {p.features?.map((f) => (
                                            <li key={f.id} className="flex gap-2">
                                                <Check className="text-sage mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                                {f.label}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button asChild variant="outline" className="mt-8">
                                        <Link href={`/paket/${p.slug}`}>Lihat detail</Link>
                                    </Button>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8" aria-labelledby="alur">
                <h2 id="alur" className="font-display text-4xl sm:text-5xl">
                    Alur kerja
                </h2>
                <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(([t, d], i) => (
                        <li key={t} className="border-t pt-5">
                            <span className="font-display text-champagne text-3xl">{String(i + 1).padStart(2, '0')}</span>
                            <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>
                                {t}
                            </h3>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{d}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8" aria-labelledby="portofolio">
                <div className="flex items-end justify-between">
                    <h2 id="portofolio" className="font-display text-4xl sm:text-5xl">
                        Portofolio
                    </h2>
                    <Link href="/portofolio" className="text-sm underline underline-offset-4">
                        Semua proyek
                    </Link>
                </div>
                {projects.length === 0 ? (
                    <p className="text-muted-foreground mt-10 border border-dashed p-10 text-center">Belum ada proyek.</p>
                ) : (
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((p) => (
                            <figure key={p.id}>
                                <PhotoPlaceholder label={p.category ?? 'Proyek'} className="aspect-[4/3] w-full" />
                                <figcaption className="mt-3 text-sm">
                                    <span className="font-medium">{p.title}</span>
                                    <span className="text-muted-foreground"> · {p.location}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-3xl px-5 pt-24 lg:px-8" aria-labelledby="faq">
                <h2 id="faq" className="font-display text-4xl sm:text-5xl">
                    Pertanyaan umum
                </h2>
                <div className="mt-8 divide-y border-y">
                    {faqs.map((f) => (
                        <details key={f.id} className="group py-5">
                            <summary className="cursor-pointer list-none font-medium marker:hidden focus-visible:outline-2">{f.question}</summary>
                            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{f.answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="bg-primary text-primary-foreground mx-5 mt-24 px-6 py-16 text-center lg:mx-auto lg:max-w-7xl">
                <h2 className="font-display text-4xl sm:text-5xl">Mari mulai bercerita.</h2>
                <p className="mx-auto mt-4 max-w-md opacity-80">
                    {vendorCount > 0 ? `${vendorCount} vendor tersedia di katalog kami.` : 'Konsultasi awal tanpa komitmen.'}
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8">
                    <Link href="/konsultasi">Jadwalkan konsultasi</Link>
                </Button>
            </section>
        </SiteLayout>
    );
}
