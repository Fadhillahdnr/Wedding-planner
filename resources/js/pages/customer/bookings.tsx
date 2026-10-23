import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dateId } from '@/lib/format';
import { type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

interface B {
    id: number;
    status: string;
    preferred_date: string;
    package: { name: string } | null;
    vendor: { name: string } | null;
    histories: { id: number; to_status: string; note: string | null; created_at: string }[];
}

const labels: Record<string, string> = {
    pending: 'Menunggu konfirmasi',
    confirmed: 'Terkonfirmasi',
    in_progress: 'Sedang berjalan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function Bookings({ bookings }: { bookings: Paginated<B> }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Booking', href: '/booking' }]}>
            <Head title="Booking saya" />
            <div className="mx-auto w-full max-w-4xl space-y-6 p-5 lg:p-8">
                <h1 className="font-display text-4xl">Booking saya</h1>
                {bookings.data.length === 0 ? (
                    <div className="border border-dashed p-12 text-center">
                        <p className="text-muted-foreground">Anda belum memiliki booking.</p>
                        <Button asChild className="mt-4">
                            <Link href="/paket">Pilih paket</Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {bookings.data.map((b) => (
                            <li key={b.id} className="bg-card border p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-display text-2xl">{b.package?.name ?? b.vendor?.name}</p>
                                        <p className="text-muted-foreground text-sm">Tanggal: {dateId(b.preferred_date)}</p>
                                    </div>
                                    <span className="bg-secondary rounded-full px-3 py-1 text-xs font-medium">{labels[b.status] ?? b.status}</span>
                                </div>
                                {b.status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() =>
                                            confirm('Batalkan booking ini?') && router.patch(`/booking/${b.id}/batal`, {}, { preserveScroll: true })
                                        }
                                    >
                                        Batalkan
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
