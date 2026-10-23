import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { idr } from '@/lib/format';
import { type PackageItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

export default function Packages({ packages }: { packages: PackageItem[] }) {
    return (
        <SiteLayout>
            <Seo title="Paket layanan" description="Pilih paket wedding planner sesuai kebutuhan dan anggaran Anda." />
            <div className="mx-auto max-w-7xl px-5 pt-16 lg:px-8">
                <h1 className="font-display text-5xl sm:text-6xl">Paket layanan</h1>
                <p className="text-muted-foreground mt-4 max-w-xl">Harga bersifat "mulai dari" dan dirinci setelah konsultasi.</p>
                {packages.length === 0 ? (
                    <p className="text-muted-foreground mt-12 border border-dashed p-12 text-center">Belum ada paket yang dipublikasikan.</p>
                ) : (
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {packages.map((p) => (
                            <article key={p.id} className="bg-card flex flex-col border p-7">
                                <h2 className="font-display text-3xl">{p.name}</h2>
                                <p className="text-muted-foreground mt-2 text-sm">{p.tagline}</p>
                                <p className="mt-6 text-sm">
                                    Mulai dari <span className="font-display text-2xl">{idr(p.price_from)}</span>
                                </p>
                                <ul className="mt-6 flex-1 space-y-2 text-sm">
                                    {p.features?.map((f) => (
                                        <li key={f.id} className="flex gap-2">
                                            <Check className="text-sage mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                            {f.label}
                                        </li>
                                    ))}
                                </ul>
                                <Button asChild className="mt-8">
                                    <Link href={`/paket/${p.slug}`}>Lihat & booking</Link>
                                </Button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
