import PlannerLayout from '@/layouts/planner-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/** Titik masuk layout untuk semua halaman terautentikasi (breadcrumbs dipertahankan agar halaman bawaan tetap kompatibel). */
export default function AppLayout({ children }: AppLayoutProps) {
    return <PlannerLayout>{children}</PlannerLayout>;
}
