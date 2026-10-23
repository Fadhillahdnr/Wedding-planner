import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SiteConfig {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string | null;
    instagram: string | null;
    address: string;
}

export interface SharedData {
    name: string;
    site: SiteConfig;
    auth: Auth;
    flash: { success: string | null };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'customer' | 'vendor';
    avatar?: string;
    email_verified_at: string | null;
    [key: string]: unknown;
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface PackageItem {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    price_from: string | null;
    is_featured: boolean;
    is_published: boolean;
    features?: { id: number; label: string }[];
}

export interface VendorItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    city: string | null;
    price_min: string | null;
    price_max: string | null;
    category?: { id: number; name: string; slug: string };
}

export interface VendorAdminItem extends VendorItem {
    vendor_category_id: number;
    contact_email: string | null;
    contact_phone: string | null;
    status: 'draft' | 'pending' | 'published';
    is_featured: boolean;
    media: { id: number; secure_url: string; alt_text: string | null }[];
}
