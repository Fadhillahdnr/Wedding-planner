import { MoneyField, TextField } from '@/components/planner/field';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

interface Props {
    wedding: {
        partner_one_name: string | null;
        partner_two_name: string | null;
        city: string | null;
        guest_estimate: number | null;
        total_budget: number | null;
        tradition: string | null;
        ceremonies: string[];
    };
    suggestedMonth: string;
    templateLabel: string;
    ceremonyOptions: string[];
}

const steps = [
    { title: 'Siapa kalian berdua?', hint: 'Nama panggilan juga boleh.' },
    {
        title: 'Kapan kira-kira harinya?',
        hint: 'Belum pasti? Pilih bulan perkiraan; semua jadwal ikut menyesuaikan saat tanggalnya sudah ditetapkan.',
    },
    { title: 'Seberapa besar acaranya?', hint: 'Perkiraan kasar sudah cukup. Katering dan souvenir dihitung dari jumlah tamu.' },
    { title: 'Berapa dana yang disiapkan?', hint: 'Boleh dikosongkan; ringkasan akan menampilkan total proyeksi dari item yang kalian isi.' },
    { title: 'Acara apa saja?', hint: 'Dipakai untuk menyusun tugas awal. Semuanya bisa diubah nanti.' },
] as const;

export default function Onboarding({ wedding, suggestedMonth, templateLabel, ceremonyOptions }: Props) {
    const [step, setStep] = useState(0);
    const [dateKnown, setDateKnown] = useState(false);
    const heading = useRef<HTMLHeadingElement>(null);

    const { data, setData, post, processing, errors, transform } = useForm({
        partner_one_name: wedding.partner_one_name ?? '',
        partner_two_name: wedding.partner_two_name ?? '',
        target_date: '',
        target_month: suggestedMonth,
        city: wedding.city ?? '',
        guest_estimate: wedding.guest_estimate ?? ('' as number | ''),
        total_budget: wedding.total_budget as number | null,
        tradition: wedding.tradition ?? '',
        ceremonies: wedding.ceremonies,
        include_honeymoon: false as boolean,
        include_prewedding: false as boolean,
        funding_name: '',
        funding_collected: null as number | null,
        funding_monthly: null as number | null,
    });

    const last = steps.length - 1;

    // Setelah pindah langkah, fokus dipindah ke judul agar pembaca layar mengumumkannya.
    const go = (next: number) => {
        setStep(next);
        requestAnimationFrame(() => heading.current?.focus());
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (step < last) return go(step + 1);
        transform((d) => ({
            ...d,
            target_date: dateKnown ? d.target_date || null : null,
            target_month: dateKnown ? null : d.target_month || null,
            guest_estimate: d.guest_estimate === '' ? null : d.guest_estimate,
        }));
        post('/onboarding');
    };

    const toggleCeremony = (name: string) =>
        setData('ceremonies', data.ceremonies.includes(name) ? data.ceremonies.filter((c) => c !== name) : [...data.ceremonies, name]);

    return (
        <div className="bg-paper text-ink flex min-h-svh flex-col justify-center px-6 py-12 sm:px-12">
            <Head title="Mulai" />
            <main className="mx-auto w-full max-w-xl">
                <p className="text-ink-faint num mb-6 text-xs tracking-[0.14em] uppercase">
                    Langkah {step + 1} dari {steps.length}
                </p>
                <h1 ref={heading} tabIndex={-1} className="text-4xl leading-tight font-medium outline-none sm:text-5xl">
                    {steps[step].title}
                </h1>
                <p className="text-ink-soft mt-3 max-w-prose">{steps[step].hint}</p>
                <hr className="border-line my-8" />

                <form onSubmit={submit} noValidate className="grid gap-6">
                    {step === 0 && (
                        <div className="grid gap-5 sm:grid-cols-2">
                            <TextField
                                label="Nama kamu"
                                name="partner_one_name"
                                autoFocus
                                value={data.partner_one_name}
                                error={errors.partner_one_name}
                                onChange={(e) => setData('partner_one_name', e.target.value)}
                            />
                            <TextField
                                label="Nama pasangan"
                                name="partner_two_name"
                                value={data.partner_two_name}
                                error={errors.partner_two_name}
                                onChange={(e) => setData('partner_two_name', e.target.value)}
                            />
                        </div>
                    )}

                    {step === 1 && (
                        <>
                            <fieldset className="grid gap-2">
                                <legend className="mb-1 text-sm font-medium">Tanggalnya sudah pasti?</legend>
                                {[
                                    [false, 'Belum, baru perkiraan bulan'],
                                    [true, 'Sudah, saya punya tanggalnya'],
                                ].map(([value, label]) => (
                                    <label key={String(value)} className="flex min-h-11 items-center gap-3 text-sm">
                                        <input
                                            type="radio"
                                            name="date_known"
                                            checked={dateKnown === value}
                                            onChange={() => setDateKnown(value as boolean)}
                                            className="accent-brand size-5"
                                        />
                                        {label as string}
                                    </label>
                                ))}
                            </fieldset>
                            {dateKnown ? (
                                <TextField
                                    label="Tanggal hari H"
                                    name="target_date"
                                    type="date"
                                    value={data.target_date}
                                    error={errors.target_date}
                                    onChange={(e) => setData('target_date', e.target.value)}
                                />
                            ) : (
                                <TextField
                                    label="Perkiraan bulan"
                                    name="target_month"
                                    type="month"
                                    value={data.target_month}
                                    error={errors.target_month}
                                    hint="Awalnya diisi sekitar 24 bulan dari sekarang; ubah sesukamu."
                                    onChange={(e) => setData('target_month', e.target.value)}
                                />
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <div className="grid gap-5 sm:grid-cols-2">
                            <TextField
                                label="Kota"
                                name="city"
                                autoFocus
                                value={data.city}
                                error={errors.city}
                                onChange={(e) => setData('city', e.target.value)}
                            />
                            <TextField
                                label="Perkiraan jumlah tamu"
                                name="guest_estimate"
                                type="number"
                                min={1}
                                inputMode="numeric"
                                value={data.guest_estimate}
                                error={errors.guest_estimate}
                                onChange={(e) => setData('guest_estimate', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <>
                            <MoneyField
                                label="Total anggaran"
                                name="total_budget"
                                value={data.total_budget}
                                error={errors.total_budget}
                                onValueChange={(v) => setData('total_budget', v)}
                                hint="Dipakai untuk membagi alokasi awal per kategori."
                            />
                            <div className="grid gap-5 sm:grid-cols-3">
                                <TextField
                                    label="Sumber dana pertama"
                                    name="funding_name"
                                    placeholder="mis. Tabungan bersama"
                                    value={data.funding_name}
                                    onChange={(e) => setData('funding_name', e.target.value)}
                                    wrapperClassName="sm:col-span-3"
                                />
                                <MoneyField
                                    label="Sudah terkumpul"
                                    value={data.funding_collected}
                                    onValueChange={(v) => setData('funding_collected', v)}
                                    wrapperClassName="sm:col-span-3 sm:grid-cols-1"
                                />
                                <MoneyField
                                    label="Setoran per bulan"
                                    value={data.funding_monthly}
                                    onValueChange={(v) => setData('funding_monthly', v)}
                                    wrapperClassName="sm:col-span-3"
                                />
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <fieldset className="grid gap-1">
                                <legend className="mb-1 text-sm font-medium">Acara yang direncanakan</legend>
                                {ceremonyOptions.map((name) => (
                                    <label key={name} className="flex min-h-11 items-center gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={data.ceremonies.includes(name)}
                                            onChange={() => toggleCeremony(name)}
                                            className="accent-brand size-5"
                                        />
                                        {name}
                                    </label>
                                ))}
                            </fieldset>
                            <TextField
                                label="Agama atau adat (opsional)"
                                name="tradition"
                                value={data.tradition}
                                onChange={(e) => setData('tradition', e.target.value)}
                            />
                            <fieldset className="grid gap-1">
                                <legend className="mb-1 text-sm font-medium">Masuk hitungan anggaran?</legend>
                                <label className="flex min-h-11 items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.include_prewedding}
                                        onChange={(e) => setData('include_prewedding', e.target.checked)}
                                        className="accent-brand size-5"
                                    />
                                    Pre-wedding
                                </label>
                                <label className="flex min-h-11 items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.include_honeymoon}
                                        onChange={(e) => setData('include_honeymoon', e.target.checked)}
                                        className="accent-brand size-5"
                                    />
                                    Honeymoon
                                </label>
                            </fieldset>
                            <p className="text-ink-faint border-line border-t pt-4 text-sm">{templateLabel}</p>
                        </>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        {step > 0 && (
                            <Button type="button" variant="ghost" className="h-12" onClick={() => go(step - 1)}>
                                Kembali
                            </Button>
                        )}
                        <Button type="submit" size="lg" className="h-12 min-w-40" disabled={processing}>
                            {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                            {step < last ? 'Lanjut' : processing ? 'Menyiapkan…' : 'Selesai dan siapkan template'}
                        </Button>
                        {step < last && (
                            <Button type="button" variant="ghost" className="text-ink-soft h-12" onClick={() => go(step + 1)}>
                                Lewati
                            </Button>
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
}
