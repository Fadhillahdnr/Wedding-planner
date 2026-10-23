import { type ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    eyebrow?: string;
    description?: ReactNode;
    actions?: ReactNode;
}

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="max-w-2xl">
                {eyebrow && <p className="text-ink-faint mb-2 text-xs tracking-[0.14em] uppercase">{eyebrow}</p>}
                <h1 className="text-4xl leading-tight font-medium sm:text-5xl">{title}</h1>
                {description && <p className="text-ink-soft mt-3 max-w-prose">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
    );
}

interface SectionHeadingProps {
    title: string;
    number?: string;
    description?: ReactNode;
    actions?: ReactNode;
    id?: string;
}

/** Judul bagian dengan penomoran editorial kecil. */
export function SectionHeading({ title, number, description, actions, id }: SectionHeadingProps) {
    return (
        <div className="border-line mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-3">
            <div>
                {number && <p className="text-ink-faint num mb-1 text-xs tracking-[0.14em] uppercase">{number}</p>}
                <h2 id={id} className="text-2xl font-medium">
                    {title}
                </h2>
                {description && <p className="text-ink-soft mt-1 text-sm">{description}</p>}
            </div>
            {actions}
        </div>
    );
}
