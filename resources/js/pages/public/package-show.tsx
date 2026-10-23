import { Field } from '@/components/site/field';
import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { idr } from '@/lib/format';
import { type PackageItem, type SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Check, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function PackageShow({ package: pkg }: { package: PackageItem }) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors } = useForm<{ package_id: number; preferred_date: string; notes: string }>({
        package_id: pkg.id,
        preferred_date: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('bookings.store'));
    };

    return (
        <SiteLayout>
            <Seo title={pkg.name} description={pkg.tagline ?? `Detail paket ${pkg.name}`} />
            <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 lg:grid-cols-12 lg:px-8">
                <div className="lg:col-span-7">
                    <Link href="/paket" className="text-muted-foreground text-sm underline underline-offset-4">
                        ← Semua paket
                    </Link>
                    <h1 className="font-display mt-4 text-5xl sm:text-6xl">{pkg.name}</h1>
                    <p className="text-muted-foreground mt-3 text-lg">{pkg.tagline}</p>
                    <p className="mt-8 text-sm">
                        Mulai dari <span className="font-display text-3xl">{idr(pkg.price_from)}</span>
                    </p>
                    <p className="mt-6 leading-relaxed">{pkg.description}</p>
                    <ul className="mt-8 space-y-3">
                        {pkg.features?.map((f) => (
                            <li key={f.id} className="flex gap-3">
                                <Check className="text-sage mt-1 size-4 shrink-0" aria-hidden="true" />
                                {f.label}
                            </li>
                        ))}
                    </ul>
                </div>
                <aside className="lg:col-span-5">
                    <div className="bg-card border p-7">
                        <h2 className="font-display text-3xl">Ajukan booking</h2>
                        {auth.user ? (
                            <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
                                <Field
                                    label="Tanggal acara"
                                    name="preferred_date"
                                    type="date"
                                    required
                                    value={data.preferred_date}
                                    onChange={(e) => setData('preferred_date', e.target.value)}
                                    error={errors.preferred_date}
                                />
                                <div className="grid gap-2">
                                    <label htmlFor="notes" className="text-sm font-medium">
                                        Catatan
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={4}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="border-input bg-background rounded-md border p-3 text-sm"
                                    />
                                    {errors.notes && (
                                        <p role="alert" className="text-destructive text-sm">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" size="lg" disabled={processing}>
                                    {processing && <LoaderCircle className="size-4 animate-spin" />} Kirim permintaan
                                </Button>
                                <p className="text-muted-foreground text-xs">
                                    Pembayaran belum diaktifkan; tim kami akan mengonfirmasi dan menagih secara manual.
                                </p>
                            </form>
                        ) : (
                            <div className="mt-4 text-sm">
                                <p className="text-muted-foreground">Masuk untuk mengajukan booking dan melacak statusnya.</p>
                                <div className="mt-5 flex gap-3">
                                    <Button asChild>
                                        <Link href="/login">Masuk</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/register">Daftar</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </SiteLayout>
    );
}
