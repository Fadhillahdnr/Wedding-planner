import { cn } from '@/lib/utils';

interface ProgressRuleProps {
    value: number;
    max: number;
    label: string;
    tone?: 'brand' | 'sage' | 'amber' | 'danger';
    className?: string;
}

const tones = { brand: 'bg-brand', sage: 'bg-sage', amber: 'bg-amber', danger: 'bg-danger' };

/** Progres berupa garis tipis; nilai teksnya selalu tersedia lewat aria-label dan role. */
export function ProgressRule({ value, max, label, tone = 'brand', className }: ProgressRuleProps) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={Math.min(value, max)}
            className={cn('bg-line h-1 w-full overflow-hidden rounded-full', className)}
        >
            <div className={cn('ease-calm h-full rounded-full transition-[width] duration-200', tones[tone])} style={{ width: `${pct}%` }} />
        </div>
    );
}
