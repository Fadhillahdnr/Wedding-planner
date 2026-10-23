import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface SeoProps {
    title: string;
    description: string;
    path?: string;
}

/** Title/description unik per halaman + canonical + Open Graph. */
export function Seo({ title, description, path }: SeoProps) {
    const { site } = usePage<SharedData>().props;
    const full = `${title} · ${site.name}`;
    const canonical = typeof window !== 'undefined' ? window.location.origin + (path ?? window.location.pathname) : undefined;

    return (
        <Head title={title}>
            <meta name="description" content={description} />
            <meta property="og:title" content={full} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            {canonical && <link rel="canonical" href={canonical} />}
        </Head>
    );
}
