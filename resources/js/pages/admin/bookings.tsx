import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dateId } from '@/lib/format';
import { type Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';

interface B {
    id: number;
    status: string;
    preferred_date: string;
    user: { name: string; email: string };
    package: { name: string } | null;
    vendor: { name: string } | null;
}
type S = { value: string; label: string };

const next: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

export default function Bookings({ bookings, filters, statuses }: { bookings: Paginated<B>; filters: { status?: string }; statuses: S[] }) {
    const label = (v: string) => statuses.find((s) => s.value === v)?.label ?? v;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Booking', href: '/admin/bookings' },
            ]}
        >
            <Head title="Booking" />
            <div className="w-full space-y-6 p-5 lg:p-8">
                <h1 className="font-display text-4xl">Booking</h1>
                <select
                    aria-label="Filter status"
                    value={filters.status ?? ''}
                    onChange={(e) => router.get('/admin/bookings', e.target.value ? { status: e.target.value } : {})}
                    className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                >
                    <option value="">Semua status</option>
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                {bookings.data.length === 0 ? (
                    <p className="text-muted-foreground border border-dashed p-10 text-center">Belum ada booking.</p>
                ) : (
                    <div className="overflow-x-auto border">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">Daftar booking</caption>
                            <thead className="bg-muted text-xs uppercase">
                                <tr>
                                    {['Pelanggan', 'Layanan', 'Tanggal', 'Status', 'Ubah ke'].map((h) => (
                                        <th key={h} scope="col" className="p-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bookings.data.map((b) => (
                                    <tr key={b.id}>
                                        <td className="p-3">
                                            {b.user.name}
                                            <br />
                                            <span className="text-muted-foreground">{b.user.email}</span>
                                        </td>
                                        <td className="p-3">{b.package?.name ?? b.vendor?.name}</td>
                                        <td className="p-3">{dateId(b.preferred_date)}</td>
                                        <td className="p-3">{label(b.status)}</td>
                                        <td className="flex flex-wrap gap-2 p-3">
                                            {next[b.status].length === 0
                                                ? '—'
                                                : next[b.status].map((n) => (
                                                      <Button
                                                          key={n}
                                                          size="sm"
                                                          variant={n === 'cancelled' ? 'outline' : 'default'}
                                                          onClick={() =>
                                                              router.patch(`/admin/bookings/${b.id}`, { status: n }, { preserveScroll: true })
                                                          }
                                                      >
                                                          {label(n)}
                                                      </Button>
                                                  ))}
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
