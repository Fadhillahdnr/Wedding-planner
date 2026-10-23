import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { idr } from '@/lib/format';
import { type Paginated, type VendorItem } from '@/types';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    vendors: Paginated<VendorItem>;
    categories: { id: number; name: string; slug: string }[];
    cities: string[];
    filters: { q?: string; category?: string; city?: string; sort?: string };
}

const sel = 'border-input bg-background h-11 rounded-md border px-3 text-sm';

export default function Vendors({ vendors, categories, cities, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (next: Record<string, string | undefined>) =>
        router.get('/vendor', Object.fromEntries(Object.entries({ ...filters, ...next }).filter(([, v]) => v)), {
            preserveState: true,
            preserveScroll: true,
        });

    return (
        <SiteLayout>
            <Seo title="Katalog vendor" description="Temukan venue, katering, dekorasi, fotografer, dan vendor pernikahan lainnya." />
            <div className="mx-auto max-w-7xl px-5 pt-16 lg:px-8">
                <h1 className="font-display text-5xl sm:text-6xl">Katalog vendor</h1>
                <form
                    role="search"
                    onSubmit={(e) => {
                        e.preventDefault();
                        apply({ q: q || undefined });
                    }}
                    className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <input
                        aria-label="Cari vendor"
                        type="search"
                        placeholder="Cari nama vendor"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className={`${sel} lg:col-span-2`}
                    />
                    <select
                        aria-label="Kategori"
                        className={sel}
                        value={filters.category ?? ''}
                        onChange={(e) => apply({ category: e.target.value || undefined })}
                    >
                        <option value="">Semua kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Kota"
                        className={sel}
                        value={filters.city ?? ''}
                        onChange={(e) => apply({ city: e.target.value || undefined })}
                    >
                        <option value="">Semua kota</option>
                        {cities.map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        aria-label="Urutkan"
                        className={sel}
                        value={filters.sort ?? ''}
                        onChange={(e) => apply({ sort: e.target.value || undefined })}
                    >
                        <option value="">Nama A–Z</option>
                        <option value="price_asc">Harga terendah</option>
                    </select>
                </form>

                {vendors.data.length === 0 ? (
                    <div className="mt-12 border border-dashed p-12 text-center">
                        <p className="text-muted-foreground">Tidak ada vendor yang cocok dengan filter Anda.</p>
                        <Button variant="outline" className="mt-4" onClick={() => router.get('/vendor')}>
                            Reset filter
                        </Button>
                    </div>
                ) : (
                    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {vendors.data.map((v) => (
                            <li key={v.id}>
                                <Link href={`/vendor/${v.slug}`} className="group block">
                                    <PhotoPlaceholder label={v.category?.name ?? 'Vendor'} className="aspect-[4/3] w-full" />
                                    <h2 className="font-display mt-4 text-2xl group-hover:underline">{v.name}</h2>
                                    <p className="text-muted-foreground text-sm">
                                        {v.category?.name} · {v.city ?? '—'}
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {idr(v.price_min)} – {idr(v.price_max)}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {vendors.last_page > 1 && (
                    <nav aria-label="Halaman" className="mt-12 flex flex-wrap justify-center gap-2">
                        {vendors.links.map((l, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={l.active ? 'default' : 'outline'}
                                disabled={!l.url}
                                onClick={() => l.url && router.get(l.url, {}, { preserveScroll: true })}
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </SiteLayout>
    );
}
