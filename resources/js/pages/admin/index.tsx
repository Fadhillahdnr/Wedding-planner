import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

type Stats = Record<'leads' | 'newLeads' | 'bookings' | 'pendingBookings' | 'packages' | 'vendors', number>;

export default function AdminIndex({ stats }: { stats: Stats }) {
    const cards: [string, number, string][] = [
        ['Lead baru', stats.newLeads, '/admin/leads'],
        ['Total lead', stats.leads, '/admin/leads'],
        ['Booking menunggu', stats.pendingBookings, '/admin/bookings'],
        ['Total booking', stats.bookings, '/admin/bookings'],
        ['Paket', stats.packages, '/admin/packages'],
        ['Vendor', stats.vendors, '/admin/packages'],
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href: '/admin' }]}>
            <Head title="Admin" />
            <div className="mx-auto w-full max-w-5xl p-5 lg:p-8">
                <h1 className="font-display text-4xl">Ringkasan</h1>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map(([l, v, h], i) => (
                        <li key={i}>
                            <Link href={h} className="bg-card hover:bg-accent block border p-6 transition-colors">
                                <p className="text-muted-foreground text-xs tracking-widest uppercase">{l}</p>
                                <p className="font-display mt-2 text-4xl">{v}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </AppLayout>
    );
}
