import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dateId, idr } from '@/lib/format';
import { type Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface L {
    id: number;
    name: string;
    email: string;
    phone: string;
    event_date: string | null;
    budget: string | null;
    message: string | null;
    status: string;
}

export default function Leads({ leads, filters, statuses }: { leads: Paginated<L>; filters: { q?: string; status?: string }; statuses: string[] }) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (p: Record<string, string | undefined>) =>
        router.get('/admin/leads', Object.fromEntries(Object.entries({ ...filters, ...p }).filter(([, v]) => v)), { preserveState: true });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Lead', href: '/admin/leads' },
            ]}
        >
            <Head title="Lead konsultasi" />
            <div className="w-full space-y-6 p-5 lg:p-8">
                <h1 className="font-display text-4xl">Lead konsultasi</h1>
                <form
                    role="search"
                    onSubmit={(e) => {
                        e.preventDefault();
                        go({ q: q || undefined });
                    }}
                    className="flex flex-wrap gap-3"
                >
                    <input
                        aria-label="Cari lead"
                        type="search"
                        placeholder="Nama atau email"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    />
                    <select
                        aria-label="Filter status"
                        value={filters.status ?? ''}
                        onChange={(e) => go({ status: e.target.value || undefined })}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                    >
                        <option value="">Semua status</option>
                        {statuses.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </form>
                {leads.data.length === 0 ? (
                    <p className="text-muted-foreground border border-dashed p-10 text-center">Belum ada lead.</p>
                ) : (
                    <div className="overflow-x-auto border">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">Daftar lead</caption>
                            <thead className="bg-muted text-xs uppercase">
                                <tr>
                                    {['Nama', 'Kontak', 'Tanggal acara', 'Anggaran', 'Status', ''].map((h, i) => (
                                        <th key={i} scope="col" className="p-3">
                                            {h || <span className="sr-only">Aksi</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leads.data.map((l) => (
                                    <tr key={l.id}>
                                        <td className="p-3 font-medium">{l.name}</td>
                                        <td className="p-3">
                                            {l.email}
                                            <br />
                                            {l.phone}
                                        </td>
                                        <td className="p-3">{dateId(l.event_date)}</td>
                                        <td className="p-3">{idr(l.budget)}</td>
                                        <td className="p-3">
                                            <select
                                                aria-label={`Status ${l.name}`}
                                                value={l.status}
                                                onChange={(e) =>
                                                    router.patch(`/admin/leads/${l.id}`, { status: e.target.value }, { preserveScroll: true })
                                                }
                                                className="border-input bg-background rounded-md border px-2 py-1"
                                            >
                                                {statuses.map((s) => (
                                                    <option key={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    confirm(`Hapus lead ${l.name}?`) &&
                                                    router.delete(`/admin/leads/${l.id}`, { preserveScroll: true })
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
                <nav aria-label="Halaman" className="flex flex-wrap gap-2">
                    {leads.links.map((l, i) => (
                        <Button
                            key={i}
                            size="sm"
                            variant={l.active ? 'default' : 'outline'}
                            disabled={!l.url}
                            onClick={() => l.url && router.get(l.url)}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </nav>
            </div>
        </AppLayout>
    );
}
