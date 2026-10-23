import { MediaUploader } from '@/components/media-uploader';
import { Field } from '@/components/site/field';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Paginated, type VendorAdminItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    vendors: Paginated<VendorAdminItem>;
    categories: { id: number; name: string }[];
    statuses: string[];
    filters: { q?: string; status?: string };
}

const statusLabel: Record<string, string> = { draft: 'Draf', pending: 'Menunggu', published: 'Terbit' };

const blank = {
    vendor_category_id: '',
    name: '',
    description: '',
    city: '',
    price_min: '',
    price_max: '',
    contact_email: '',
    contact_phone: '',
    status: 'draft',
    is_featured: false,
};

export default function Vendors({ vendors, categories, statuses, filters }: Props) {
    const [editing, setEditing] = useState<VendorAdminItem | null>(null);
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(blank);

    const startEdit = (v: VendorAdminItem) => {
        setEditing(v);
        clearErrors();
        setData({
            vendor_category_id: String(v.vendor_category_id),
            name: v.name,
            description: v.description ?? '',
            city: v.city ?? '',
            price_min: v.price_min ?? '',
            price_max: v.price_max ?? '',
            contact_email: v.contact_email ?? '',
            contact_phone: v.contact_phone ?? '',
            status: v.status,
            is_featured: v.is_featured,
        });
    };
    const cancel = () => {
        setEditing(null);
        reset();
        clearErrors();
    };
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: cancel };
        if (editing) put(`/admin/vendors/${editing.id}`, opts);
        else post('/admin/vendors', opts);
    };
    const filter = (key: 'q' | 'status', value: string) =>
        router.get('/admin/vendors', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    const refresh = () => router.reload({ only: ['vendors'] });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Vendor', href: '/admin/vendors' },
            ]}
        >
            <Head title="Kelola vendor" />
            <div className="w-full space-y-8 p-5 lg:p-8">
                <h1 className="font-display text-4xl">Vendor</h1>

                <form onSubmit={submit} className="bg-card grid gap-4 border p-5 sm:grid-cols-3" noValidate>
                    <h2 className="text-lg font-medium sm:col-span-3">{editing ? `Ubah ${editing.name}` : 'Tambah vendor'}</h2>
                    <Field label="Nama" name="name" required value={data.name} error={errors.name} onChange={(e) => setData('name', e.target.value)} />
                    <div className="grid gap-2">
                        <label htmlFor="f-category" className="text-sm font-medium">
                            Kategori *
                        </label>
                        <select
                            id="f-category"
                            required
                            aria-invalid={!!errors.vendor_category_id}
                            value={data.vendor_category_id}
                            onChange={(e) => setData('vendor_category_id', e.target.value)}
                            className="border-input bg-background h-11 border px-3 text-sm"
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.vendor_category_id && (
                            <p role="alert" className="text-destructive text-sm">
                                {errors.vendor_category_id}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="f-status" className="text-sm font-medium">
                            Status
                        </label>
                        <select
                            id="f-status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="border-input bg-background h-11 border px-3 text-sm"
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {statusLabel[s] ?? s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Field label="Kota" name="city" value={data.city} error={errors.city} onChange={(e) => setData('city', e.target.value)} />
                    <Field
                        label="Harga minimum (Rp)"
                        name="price_min"
                        type="number"
                        min={0}
                        value={data.price_min}
                        error={errors.price_min}
                        onChange={(e) => setData('price_min', e.target.value)}
                    />
                    <Field
                        label="Harga maksimum (Rp)"
                        name="price_max"
                        type="number"
                        min={0}
                        value={data.price_max}
                        error={errors.price_max}
                        onChange={(e) => setData('price_max', e.target.value)}
                    />
                    <Field
                        label="Email kontak"
                        name="contact_email"
                        type="email"
                        value={data.contact_email}
                        error={errors.contact_email}
                        onChange={(e) => setData('contact_email', e.target.value)}
                    />
                    <Field
                        label="Telepon kontak"
                        name="contact_phone"
                        value={data.contact_phone}
                        error={errors.contact_phone}
                        onChange={(e) => setData('contact_phone', e.target.value)}
                    />
                    <label className="flex items-center gap-2 self-end pb-3 text-sm">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="size-5" />
                        Unggulan
                    </label>
                    <div className="grid gap-2 sm:col-span-3">
                        <label htmlFor="f-desc" className="text-sm font-medium">
                            Deskripsi
                        </label>
                        <textarea
                            id="f-desc"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="border-input bg-background border p-3 text-sm"
                        />
                        {errors.description && (
                            <p role="alert" className="text-destructive text-sm">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 sm:col-span-3">
                        <Button type="submit" disabled={processing}>
                            {editing ? 'Simpan perubahan' : 'Tambah vendor'}
                        </Button>
                        {editing && (
                            <Button type="button" variant="ghost" onClick={cancel}>
                                Batal
                            </Button>
                        )}
                    </div>
                    {editing && (
                        <div className="sm:col-span-3">
                            <MediaUploader collection="vendors" vendorId={editing.id} label="Unggah foto vendor" onUploaded={refresh} />
                        </div>
                    )}
                </form>

                <div className="flex flex-wrap gap-3">
                    <input
                        type="search"
                        aria-label="Cari vendor"
                        placeholder="Cari nama…"
                        defaultValue={filters.q}
                        onKeyDown={(e) => e.key === 'Enter' && filter('q', e.currentTarget.value)}
                        className="border-input bg-background h-11 border px-3 text-sm"
                    />
                    <select
                        aria-label="Filter status"
                        value={filters.status ?? ''}
                        onChange={(e) => filter('status', e.target.value)}
                        className="border-input bg-background h-11 border px-3 text-sm"
                    >
                        <option value="">Semua status</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {statusLabel[s] ?? s}
                            </option>
                        ))}
                    </select>
                </div>

                {vendors.data.length === 0 ? (
                    <p className="text-muted-foreground border border-dashed p-10 text-center">Belum ada vendor.</p>
                ) : (
                    <div className="overflow-x-auto border">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">Daftar vendor</caption>
                            <thead className="bg-muted text-xs uppercase">
                                <tr>
                                    {['Foto', 'Nama', 'Kategori', 'Kota', 'Status', ''].map((h, i) => (
                                        <th key={i} scope="col" className="p-3">
                                            {h || <span className="sr-only">Aksi</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {vendors.data.map((v) => (
                                    <tr key={v.id}>
                                        <td className="p-3">
                                            {v.media[0] ? (
                                                <img src={v.media[0].secure_url} alt={v.media[0].alt_text ?? v.name} className="size-12 object-cover" />
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="p-3 font-medium">
                                            {v.name}
                                            {v.is_featured && <span className="text-muted-foreground ml-2 text-xs">Unggulan</span>}
                                        </td>
                                        <td className="p-3">{v.category?.name}</td>
                                        <td className="p-3">{v.city ?? '—'}</td>
                                        <td className="p-3">{statusLabel[v.status] ?? v.status}</td>
                                        <td className="flex gap-1 p-3">
                                            <Button variant="ghost" size="sm" onClick={() => startEdit(v)}>
                                                Ubah
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => confirm(`Hapus vendor ${v.name}?`) && router.delete(`/admin/vendors/${v.id}`, { preserveScroll: true })}
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
