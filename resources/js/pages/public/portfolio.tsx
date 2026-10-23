import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { dateId } from '@/lib/format';
import { type Paginated } from '@/types';

interface Project {
    id: number;
    title: string;
    category: string | null;
    summary: string | null;
    location: string | null;
    event_date: string | null;
}

export default function Portfolio({ projects }: { projects: Paginated<Project> }) {
    return (
        <SiteLayout>
            <Seo title="Portofolio" description="Sekilas proyek pernikahan yang pernah kami tangani." />
            <div className="mx-auto max-w-7xl px-5 pt-16 lg:px-8">
                <h1 className="font-display text-5xl sm:text-6xl">Portofolio</h1>
                {projects.data.length === 0 ? (
                    <p className="text-muted-foreground mt-12 border border-dashed p-12 text-center">Belum ada proyek yang dipublikasikan.</p>
                ) : (
                    <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.data.map((p) => (
                            <li key={p.id}>
                                <PhotoPlaceholder label={p.category ?? 'Proyek'} className="aspect-[4/3] w-full" />
                                <h2 className="font-display mt-4 text-2xl">{p.title}</h2>
                                <p className="text-muted-foreground text-sm">
                                    {p.location} · {dateId(p.event_date)}
                                </p>
                                <p className="mt-2 text-sm">{p.summary}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </SiteLayout>
    );
}
