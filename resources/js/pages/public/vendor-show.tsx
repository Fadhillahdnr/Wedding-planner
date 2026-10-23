import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { idr } from '@/lib/format';
import { type VendorItem } from '@/types';
import { Link } from '@inertiajs/react';

export default function VendorShow({ vendor }: { vendor: VendorItem }) {
    return (
        <SiteLayout>
            <Seo title={vendor.name} description={vendor.description ?? `Profil vendor ${vendor.name}`} />
            <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 lg:grid-cols-2 lg:px-8">
                <PhotoPlaceholder label={vendor.category?.name ?? 'Vendor'} className="aspect-[4/3] w-full" />
                <div>
                    <Link href="/vendor" className="text-muted-foreground text-sm underline underline-offset-4">
                        ← Katalog vendor
                    </Link>
                    <p className="text-muted-foreground mt-6 text-xs tracking-widest uppercase">
                        {vendor.category?.name} · {vendor.city}
                    </p>
                    <h1 className="font-display mt-2 text-5xl">{vendor.name}</h1>
                    <p className="mt-6 leading-relaxed">{vendor.description}</p>
                    <p className="mt-6 text-sm">
                        Kisaran harga:{' '}
                        <strong>
                            {idr(vendor.price_min)} – {idr(vendor.price_max)}
                        </strong>
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/konsultasi">Tanya via konsultasi</Link>
                    </Button>
                </div>
            </div>
        </SiteLayout>
    );
}
