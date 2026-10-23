import { Field } from '@/components/site/field';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { idr } from '@/lib/format';
import { type PackageItem, type Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Packages({ packages }: { packages: Paginated<PackageItem> }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        tagline: '',
        price_from: '',
        is_featured: false,
        is_published: true,
    });
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/packages', { preserveScroll: true, onSuccess: () => reset() });
    };
    const toggle = (p: PackageItem, k: 'is_published' | 'is_featured') =>
        router.put(
            `/admin/packages/${p.id}`,
            {
                name: p.name,
                tagline: p.tagline,
                description: p.description,
                price_from: p.price_from,
                is_featured: p.is_featured,
                is_published: p.is_published,
                [k]: !p[k],
            },
            { preserveScroll: true },
        );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Paket', href: '/admin/packages' },
            ]}
        >
            <Head title="Kelola paket" />
            <div className="w-full space-y-8 p-5 lg:p-8">
                <h1 className="font-display text-4xl">Paket</h1>
                <form onSubmit={submit} className="bg-card grid gap-4 border p-5 sm:grid-cols-4 sm:items-end" noValidate>
                    <Field
                        label="Nama"
                        name="name"
                        required
                        value={data.name}
                        error={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <Field label="Tagline" name="tagline" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} />
                    <Field
                        label="Harga mulai dari (Rp)"
                        name="price_from"
                        type="number"
                        min={0}
                        value={data.price_from}
                        error={errors.price_from}
                        onChange={(e) => setData('price_from', e.target.value)}
                    />
                    <Button type="submit" disabled={processing}>
                        Tambah paket
                    </Button>
                </form>
                {packages.data.length === 0 ? (
                    <p className="text-muted-foreground border border-dashed p-10 text-center">Belum ada paket.</p>
                ) : (
                    <div className="overflow-x-auto border">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">Daftar paket</caption>
                            <thead className="bg-muted text-xs uppercase">
                                <tr>
                                    {['Nama', 'Harga', 'Terbit', 'Unggulan', ''].map((h, i) => (
                                        <th key={i} scope="col" className="p-3">
                                            {h || <span className="sr-only">Aksi</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {packages.data.map((p) => (
                                    <tr key={p.id}>
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3">{idr(p.price_from)}</td>
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                aria-label={`Terbitkan ${p.name}`}
                                                checked={p.is_published}
                                                onChange={() => toggle(p, 'is_published')}
                                                className="size-5"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                aria-label={`Unggulkan ${p.name}`}
                                                checked={p.is_featured}
                                                onChange={() => toggle(p, 'is_featured')}
                                                className="size-5"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    confirm(`Hapus paket ${p.name}?`) &&
                                                    router.delete(`/admin/packages/${p.id}`, { preserveScroll: true })
                                                }
                                            >
                                                Hapus
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
