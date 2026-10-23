import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    is_owner: boolean;
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

export interface SharedData {
    name: string;
    auth: Auth;
    couple: string | null;
    flash: { success: string | null };
    media: { max_bytes: number; video_max_bytes: number };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    [key: string]: unknown;
}

export interface BudgetPlan {
    need: number;
    months_left: number | null;
    event_passed: boolean;
    required_per_month: number | null;
    planned_per_month: number;
    on_track: boolean;
    shortfall_per_month: number;
    meet_months: number | null;
    meet_date: string | null;
    meets_before_event: boolean | null;
}

export interface TaskItem {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    status: 'belum' | 'dikerjakan' | 'selesai' | 'dilewati';
    priority: 'rendah' | 'normal' | 'tinggi';
    phase: number | null;
    assignee_id: number | null;
    assignee: string | null;
    vendor_slot_id: number | null;
    date_locked: boolean;
    needs_reschedule: boolean;
    from_template: boolean;
}

export interface BudgetItemData {
    id: number;
    name: string;
    pricing_mode: 'fixed' | 'per_guest';
    estimate_min: number | null;
    estimate_max: number | null;
    price_per_guest: number | null;
    agreed_amount: number | null;
    notes: string | null;
    estimate_mid: number;
    projected: number;
    paid: number;
    overpaid: boolean;
}

export interface BudgetCategoryData {
    id: number;
    name: string;
    allocated_amount: number;
    projected: number;
    items: BudgetItemData[];
}

export interface FundingData {
    id: number;
    name: string;
    collected_amount: number;
    target_amount: number | null;
    monthly_contribution: number;
}

export interface PaymentData {
    id: number;
    budget_item_id: number;
    item: string | null;
    label: string;
    amount: number;
    due_date: string | null;
    status: 'direncanakan' | 'jatuh_tempo' | 'lunas' | 'dibatalkan';
    paid_on: string | null;
    method: string | null;
    notes: string | null;
}

export interface VendorSlotRow {
    id: number;
    name: string;
    need: 'needed' | 'optional' | 'not_needed';
    ideal_months_before: number | null;
    candidate_count: number;
    chosen: { id: number; name: string; quoted_price: number | null } | null;
    status: string;
}

export interface CriterionData {
    id: number;
    name: string;
    weight: number;
}

export interface MediaItem {
    id: number;
    kind: 'photo' | 'video' | 'document';
    format: string | null;
    bytes: number;
}

export interface MeetingData {
    id: number;
    media: MediaItem[];
    met_on: string;
    notes: string | null;
    follow_up: string | null;
}

export interface CandidateData {
    id: number;
    name: string;
    city: string | null;
    phone: string | null;
    instagram: string | null;
    website: string | null;
    package_name: string | null;
    quoted_price: number | null;
    quoted_on: string | null;
    quote_valid_until: string | null;
    inclusions: string | null;
    exclusions: string | null;
    pros: string | null;
    cons: string | null;
    source: string | null;
    notes: string | null;
    status: 'shortlist' | 'dihubungi' | 'survei' | 'negosiasi' | 'terpilih' | 'ditolak';
    scores: Record<string, number>;
    weighted_score: number | null;
    estimate_difference: number | null;
    media: MediaItem[];
    meetings: MeetingData[];
}
