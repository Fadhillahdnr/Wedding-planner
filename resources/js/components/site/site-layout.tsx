import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Menu } from 'lucide-react';
import { type ReactNode } from 'react';

const nav = [
    { label: 'Paket', href: '/paket' },
    { label: 'Vendor', href: '/vendor' },
    { label: 'Portofolio', href: '/portofolio' },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
    const { site, auth, flash } = usePage<SharedData>().props;
    const here = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <a
                href="#konten"
                className="bg-primary text-primary-foreground sr-only z-50 px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
                Lewati ke konten
            </a>
            <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
                    <Link href="/" className="font-display text-2xl font-medium tracking-tight">
                        {site.name}
                    </Link>
                    <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                aria-current={here.startsWith(n.href) ? 'page' : undefined}
                                className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground text-sm transition-colors"
                            >
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden items-center gap-3 md:flex">
                        {auth.user ? (
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/login">Masuk</Link>
                            </Button>
                        )}
                        <Button asChild size="sm">
                            <Link href="/konsultasi">Jadwalkan konsultasi</Link>
                        </Button>
                    </div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col gap-6 p-6">
                            <SheetTitle className="font-display text-2xl">{site.name}</SheetTitle>
                            {[
                                ...nav,
                                { label: auth.user ? 'Dashboard' : 'Masuk', href: auth.user ? '/dashboard' : '/login' },
                                { label: 'Konsultasi', href: '/konsultasi' },
                            ].map((n) => (
                                <Link key={n.href} href={n.href} className="text-lg">
                                    {n.label}
                                </Link>
                            ))}
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {flash.success && (
                <div role="status" className="bg-sage/15 text-foreground flex items-center justify-center gap-2 px-5 py-3 text-sm">
                    <CheckCircle2 className="text-sage size-4" aria-hidden="true" />
                    {flash.success}
                </div>
            )}

            <main id="konten" className="flex-1">
                {children}
            </main>

            <footer className="bg-secondary mt-24 border-t">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                    <div className="lg:col-span-2">
                        <p className="font-display text-2xl">{site.name}</p>
                        <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">{site.tagline}</p>
                    </div>
                    <nav aria-label="Footer" className="grid content-start gap-2 text-sm">
                        <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Jelajahi</p>
                        {[...nav, { label: 'Konsultasi', href: '/konsultasi' }].map((n) => (
                            <Link key={n.href} href={n.href} className="hover:underline">
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="grid content-start gap-2 text-sm">
                        <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Kontak</p>
                        <a href={`mailto:${site.email}`} className="hover:underline">
                            {site.email}
                        </a>
                        <span>{site.phone}</span>
                        <span className="text-muted-foreground">{site.address}</span>
                        {site.instagram && (
                            <a href={site.instagram} className="hover:underline" rel="noopener noreferrer" target="_blank">
                                Instagram
                            </a>
                        )}
                    </div>
                </div>
                <p className="text-muted-foreground border-t py-5 text-center text-xs">
                    © {new Date().getFullYear()} {site.name}. Konten situs ini adalah demo sampai diganti.
                </p>
            </footer>
        </div>
    );
}
