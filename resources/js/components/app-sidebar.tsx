import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Globe, Inbox, LayoutGrid, Package, Store } from 'lucide-react';
import AppLogo from './app-logo';

const customerNav: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    { title: 'Booking saya', url: '/booking', icon: CalendarCheck },
];

const adminNav: NavItem[] = [
    { title: 'Ringkasan admin', url: '/admin', icon: LayoutGrid },
    { title: 'Lead', url: '/admin/leads', icon: Inbox },
    { title: 'Booking', url: '/admin/bookings', icon: CalendarCheck },
    { title: 'Paket', url: '/admin/packages', icon: Package },
    { title: 'Vendor', url: '/admin/vendors', icon: Store },
];

const footerNavItems: NavItem[] = [{ title: 'Lihat situs', url: '/', icon: Globe }];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isStaff = auth.user?.role === 'admin' || auth.user?.role === 'staff';
    const mainNavItems = isStaff ? [...adminNav, ...customerNav.slice(0, 0)] : customerNav;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
