import { Field } from '@/components/site/field';
import { Seo } from '@/components/site/seo';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type Form = { name: string; email: string; phone: string; event_date: string; location: string; budget: string; message: string; website: string };

export default function Consultation() {
    const { data, setData, post, processing, errors, reset } = useForm<Form>({
        name: '',
        email: '',
        phone: '',
        event_date: '',
        location: '',
        budget: '',
        message: '',
        website: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/konsultasi', { preserveScroll: true, onSuccess: () => reset() });
    };
    const bind = (k: keyof Form) => ({
        name: k,
        value: data[k],
        error: errors[k],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setData(k, e.target.value),
    });

    return (
        <SiteLayout>
            <Seo title="Jadwalkan konsultasi" description="Ceritakan rencana pernikahan Anda dan tim kami akan menghubungi dalam 1×24 jam kerja." />
            <div className="mx-auto max-w-2xl px-5 pt-16 lg:px-8">
                <h1 className="font-display text-5xl sm:text-6xl">Jadwalkan konsultasi</h1>
                <p className="text-muted-foreground mt-4">Ceritakan rencana Anda. Kolom bertanda * wajib diisi.</p>
                <form onSubmit={submit} className="mt-10 grid gap-6" noValidate>
                    <Field label="Nama lengkap" required autoComplete="name" {...bind('name')} />
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Email" type="email" required autoComplete="email" {...bind('email')} />
                        <Field label="Nomor telepon / WhatsApp" type="tel" required autoComplete="tel" {...bind('phone')} />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Tanggal acara (opsional)" type="date" {...bind('event_date')} />
                        <Field label="Lokasi (opsional)" {...bind('location')} />
                    </div>
                    <Field label="Estimasi anggaran, Rp (opsional)" type="number" inputMode="numeric" min={0} {...bind('budget')} />
                    <div className="grid gap-2">
                        <label htmlFor="message" className="text-sm font-medium">
                            Kebutuhan / catatan
                        </label>
                        <textarea
                            id="message"
                            rows={5}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            aria-invalid={!!errors.message}
                            className="border-input bg-background rounded-md border p-3 text-sm"
                        />
                        {errors.message && (
                            <p role="alert" className="text-destructive text-sm">
                                {errors.message}
                            </p>
                        )}
                    </div>
                    {/* Honeypot: disembunyikan dari pengguna & pembaca layar */}
                    <div aria-hidden="true" className="absolute -left-[9999px]">
                        <label>
                            Website
                            <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData('website', e.target.value)} />
                        </label>
                    </div>
                    <Button type="submit" size="lg" disabled={processing}>
                        {processing && <LoaderCircle className="size-4 animate-spin" />} Kirim permintaan
                    </Button>
                </form>
            </div>
        </SiteLayout>
    );
}
