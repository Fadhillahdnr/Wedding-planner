import { rupiah } from '@/lib/format';
import { cn } from '@/lib/utils';

interface MoneyFigureProps {
    label: string;
    value: number | null | undefined;
    note?: string;
    size?: 'md' | 'lg';
    className?: string;
}

/** Angka uang besar dan tenang: label kecil di atas, angka serif, catatan di bawah. */
export function MoneyFigure({ label, value, note, size = 'md', className }: MoneyFigureProps) {
    return (
        <div className={className}>
            <p className="text-ink-faint text-xs tracking-[0.14em] uppercase">{label}</p>
            <p className={cn('num font-display mt-1 font-medium', size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl')}>
                {rupiah(value)}
            </p>
            {note && <p className="text-ink-soft mt-1 text-sm">{note}</p>}
        </div>
    );
}
