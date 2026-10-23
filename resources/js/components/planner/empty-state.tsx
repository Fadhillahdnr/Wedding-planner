import { type ReactNode } from 'react';

/** Keadaan kosong yang memberi langkah berikutnya, dengan garis SVG sederhana (bukan kotak abu-abu). */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
    return (
        <div className="border-line-strong/40 flex flex-col items-start gap-3 rounded-md border border-dashed px-6 py-10">
            <svg width="56" height="16" viewBox="0 0 56 16" fill="none" aria-hidden="true" className="text-line-strong">
                <path d="M1 8h54M1 3v10M55 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h3 className="text-xl">{title}</h3>
            {children && <p className="text-ink-soft max-w-prose text-sm">{children}</p>}
            {action}
        </div>
    );
}
