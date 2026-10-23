import { cn } from '@/lib/utils';
import { CheckCircle2, CircleAlert, CircleDashed, TriangleAlert } from 'lucide-react';

const styles = {
    aman: { icon: CheckCircle2, className: 'bg-sage-soft text-sage' },
    mendekati: { icon: TriangleAlert, className: 'bg-amber-soft text-amber' },
    melebihi: { icon: CircleAlert, className: 'bg-danger-soft text-danger' },
    belum_diatur: { icon: CircleDashed, className: 'bg-sunk text-ink-soft' },
} as const;

export type BudgetStatusValue = keyof typeof styles;

/** Status dibaca lewat ikon + teks + warna, tidak pernah warna saja. */
export function StatusBadge({ status, label, className }: { status: BudgetStatusValue; label: string; className?: string }) {
    const { icon: Icon, className: tone } = styles[status] ?? styles.belum_diatur;

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', tone, className)}>
            <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
            {label}
        </span>
    );
}
