import { Link } from '@inertiajs/react';

interface Props {
    prev: string | null;
    next: string | null;
}

export function SimplePagination({ prev, next }: Props) {
    if (!prev && !next) return null;

    return (
        <nav aria-label="Halaman" className="mt-8 flex justify-between text-sm">
            {prev ? (
                <Link href={prev} preserveScroll className="inline-flex min-h-11 items-center underline underline-offset-4">
                    ← Sebelumnya
                </Link>
            ) : (
                <span />
            )}
            {next && (
                <Link href={next} preserveScroll className="inline-flex min-h-11 items-center underline underline-offset-4">
                    Berikutnya →
                </Link>
            )}
        </nav>
    );
}
