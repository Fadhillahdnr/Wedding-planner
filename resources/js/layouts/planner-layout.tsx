import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { CalendarRange, House, Images, LogOut, Mail, Settings2, Store, UserRound, Wallet } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

const nav = [
    { title: 'Ringkasan', href: '/dashboard', icon: House },
    { title: 'Anggaran', href: '/anggaran', icon: Wallet },
    { title: 'Timeline', href: '/timeline', icon: CalendarRange },
    { title: 'Vendor', href: '/vendor', icon: Store },
    { title: 'Kenangan', href: '/kenangan', icon: Images },
    { title: 'Catatan', href: '/catatan', icon: Mail },
];

function isActive(url: string, href: string) {
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
}

function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!flash.success) return;
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(timer);
    }, [flash.success]);

    return (
        <div role="status" aria-live="polite" className="mx-auto max-w-6xl px-4 sm:px-8">
            {visible && flash.success && <p className="bg-sage-soft text-sage mt-4 rounded-md px-4 py-3 text-sm">{flash.success}</p>}
        </div>
    );
}

export default function PlannerLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage<SharedData>();
    const { auth, couple } = props;

    return (
        <div className="bg-paper text-ink min-h-screen pb-24 md:pb-0">
            <a
                href="#konten"
                className="bg-card focus:ring-ring sr-only rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:ring-2"
            >
                Lewati ke konten
            </a>

            <header className="border-line bg-paper/95 sticky top-0 z-30 border-b backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-8">
                    <Link href="/dashboard" className="font-display text-xl font-medium">
                        {couple ?? 'Wedding Planner'}
                    </Link>

                    <nav aria-label="Utama" className="hidden items-center gap-1 md:flex">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive(url, item.href) ? 'page' : undefined}
                                className={cn(
                                    'ease-calm rounded-md px-3 py-2 text-sm transition-colors duration-150',
                                    isActive(url, item.href)
                                        ? 'text-brand font-medium underline decoration-1 underline-offset-8'
                                        : 'text-ink-soft hover:text-ink',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-11 gap-2" aria-label="Menu akun">
                                <UserRound className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                <span className="hidden max-w-32 truncate sm:inline">{auth.user.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-ink-faint text-xs font-normal">{auth.user.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/pengaturan/pernikahan" className="gap-2">
                                    <Settings2 className="size-4" strokeWidth={1.5} aria-hidden="true" /> Pengaturan pernikahan
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/profile" className="gap-2">
                                    <UserRound className="size-4" strokeWidth={1.5} aria-hidden="true" /> Akun saya
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => router.post('/logout')} className="gap-2">
                                <LogOut className="size-4" strokeWidth={1.5} aria-hidden="true" /> Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <FlashMessage />

            <main id="konten" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
                {children}
            </main>

            <nav aria-label="Navigasi bawah" className="border-line bg-paper fixed inset-x-0 bottom-0 z-30 border-t md:hidden">
                <ul className="grid grid-cols-6">
                    {nav.map((item) => {
                        const active = isActive(url, item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex min-h-16 flex-col items-center justify-center gap-1 text-[11px]',
                                        active ? 'text-brand font-medium' : 'text-ink-soft',
                                    )}
                                >
                                    <item.icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
