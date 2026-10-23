import { type ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

/** Kolom sempit rata kiri tanpa kartu: judul serif, garis tipis, lalu form (override halaman login di MASTER). */
export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="bg-paper text-ink flex min-h-svh flex-col justify-center px-6 py-12 sm:px-12">
            <main className="mx-auto w-full max-w-md">
                <p className="text-ink-faint mb-6 text-xs tracking-[0.14em] uppercase">Wedding Planner Pribadi</p>
                <h1 className="text-4xl leading-tight font-medium sm:text-5xl">{title}</h1>
                {description && <p className="text-ink-soft mt-3">{description}</p>}
                <hr className="border-line my-8" />
                {children}
            </main>
        </div>
    );
}
