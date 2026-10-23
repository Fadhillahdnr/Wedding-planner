import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { MoneyField, SelectField, TextField } from '@/components/planner/field';
import { PageHeader, SectionHeading } from '@/components/planner/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { bulan, tanggal } from '@/lib/format';
import { Head, router, useForm } from '@inertiajs/react';
import { Copy, RotateCcw } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Change {
    id: number;
    title: string;
    from: string | null;
    to: string | null;
    ideal: string;
    needs_reschedule: boolean;
}

interface Props {
    wedding: {
        partner_one_name: string | null;
        partner_two_name: string | null;
        city: string | null;
        timezone: string;
        guest_estimate: number | null;
        total_budget: number | null;
        contingency_percent: number;
        price_buffer_percent: number;
        warning_threshold_percent: number;
        include_honeymoon: boolean;
        include_prewedding: boolean;
        target_date: string | null;
        target_month: string | null;
    };
    isOwner: boolean;
    members: { id: number; name: string; email: string; role: string }[];
    invitations: { id: number; email: string; expires_at: string }[];
    inviteLink: string | null;
}

const xsrf = () => decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

export default function WeddingSettings({ wedding, isOwner, members, invitations, inviteLink }: Props) {
    const form = useForm({
        partner_one_name: wedding.partner_one_name ?? '',
        partner_two_name: wedding.partner_two_name ?? '',
        city: wedding.city ?? '',
        timezone: wedding.timezone,
        guest_estimate: (wedding.guest_estimate ?? '') as number | '',
        total_budget: wedding.total_budget as number | null,
        contingency_percent: wedding.contingency_percent,
        price_buffer_percent: wedding.price_buffer_percent,
        warning_threshold_percent: wedding.warning_threshold_percent,
        include_honeymoon: wedding.include_honeymoon as boolean,
        include_prewedding: wedding.include_prewedding as boolean,
    });

    const dateForm = useForm({
        known: wedding.target_date !== null,
        target_date: wedding.target_date ?? '',
        target_month: wedding.target_month ?? '',
    });
    const [changes, setChanges] = useState<Change[] | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const inviteForm = useForm({ email: '' });
    const [removing, setRemoving] = useState<number | null>(null);

    const payload = () =>
        dateForm.data.known
            ? { target_date: dateForm.data.target_date, target_month: null }
            : { target_date: null, target_month: dateForm.data.target_month };

    const saveSettings: FormEventHandler = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, guest_estimate: d.guest_estimate === '' ? null : d.guest_estimate }));
        form.put('/pengaturan/pernikahan', { preserveScroll: true });
    };

    const previewDate: FormEventHandler = async (e) => {
        e.preventDefault();
        setDateError(null);
        setLoadingPreview(true);
        try {
            const res = await fetch('/pengaturan/hari-h/pratinjau', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
                body: JSON.stringify(payload()),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.errors ? (Object.values(json.errors)[0] as string[])[0] : 'Tanggal tidak valid.');
            setChanges(json.changes);
        } catch (err) {
            setDateError(err instanceof Error ? err.message : 'Gagal memuat pratinjau.');
        } finally {
            setLoadingPreview(false);
        }
    };

    const applyDate = () => {
        setSaving(true);
        router.put('/pengaturan/hari-h', payload(), {
            preserveScroll: true,
            onFinish: () => {
                setSaving(false);
                setChanges(null);
            },
        });
    };

    const invite: FormEventHandler = (e) => {
        e.preventDefault();
        inviteForm.post('/pengaturan/undangan', { preserveScroll: true, onSuccess: () => inviteForm.reset() });
    };

    const rescheduled = changes?.filter((c) => c.needs_reschedule).length ?? 0;

    return (
        <AppLayout>
            <Head title="Pengaturan pernikahan" />

            <div className="space-y-16">
                <PageHeader
                    eyebrow="Pengaturan"
                    title="Pernikahan kita"
                    description="Semua angka bisnis ada di sini, bukan di kode. Mengubahnya langsung memperbarui anggaran dan ringkasan."
                />

                <section aria-labelledby="hari-h">
                    <SectionHeading
                        id="hari-h"
                        number="01"
                        title="Hari H"
                        description={
                            wedding.target_date
                                ? `Tanggal pasti: ${tanggal(wedding.target_date)}`
                                : wedding.target_month
                                  ? `Perkiraan: ${bulan(wedding.target_month)}`
                                  : 'Belum diperkirakan'
                        }
                    />
                    <form onSubmit={previewDate} noValidate className="grid max-w-xl gap-5">
                        <fieldset className="grid gap-1">
                            <legend className="mb-1 text-sm font-medium">Status tanggal</legend>
                            <label className="flex min-h-11 items-center gap-3 text-sm">
                                <input
                                    type="radio"
                                    name="known"
                                    checked={!dateForm.data.known}
                                    onChange={() => dateForm.setData('known', false)}
                                    className="accent-brand size-5"
                                />
                                Perkiraan bulan
                            </label>
                            <label className="flex min-h-11 items-center gap-3 text-sm">
                                <input
                                    type="radio"
                                    name="known"
                                    checked={dateForm.data.known}
                                    onChange={() => dateForm.setData('known', true)}
                                    className="accent-brand size-5"
                                />
                                Tanggal pasti
                            </label>
                        </fieldset>
                        {dateForm.data.known ? (
                            <TextField
                                label="Tanggal hari H"
                                name="target_date"
                                type="date"
                                required
                                value={dateForm.data.target_date}
                                error={dateError ?? undefined}
                                onChange={(e) => dateForm.setData('target_date', e.target.value)}
                            />
                        ) : (
                            <TextField
                                label="Perkiraan bulan"
                                name="target_month"
                                type="month"
                                required
                                value={dateForm.data.target_month}
                                error={dateError ?? undefined}
                                onChange={(e) => dateForm.setData('target_month', e.target.value)}
                            />
                        )}
                        <div>
                            <Button type="submit" variant="outline" className="h-11" disabled={loadingPreview}>
                                {loadingPreview ? 'Menghitung…' : 'Lihat dampak ke jadwal'}
                            </Button>
                        </div>
                    </form>
                </section>

                <section aria-labelledby="data">
                    <SectionHeading id="data" number="02" title="Data & aturan hitung" />
                    <form onSubmit={saveSettings} noValidate className="grid max-w-3xl gap-5 sm:grid-cols-2">
                        <TextField
                            label="Nama kamu"
                            name="partner_one_name"
                            value={form.data.partner_one_name}
                            error={form.errors.partner_one_name}
                            onChange={(e) => form.setData('partner_one_name', e.target.value)}
                        />
                        <TextField
                            label="Nama pasangan"
                            name="partner_two_name"
                            value={form.data.partner_two_name}
                            error={form.errors.partner_two_name}
                            onChange={(e) => form.setData('partner_two_name', e.target.value)}
                        />
                        <TextField
                            label="Kota"
                            name="city"
                            value={form.data.city}
                            error={form.errors.city}
                            onChange={(e) => form.setData('city', e.target.value)}
                        />
                        <SelectField
                            label="Zona waktu"
                            name="timezone"
                            value={form.data.timezone}
                            error={form.errors.timezone}
                            onChange={(e) => form.setData('timezone', e.target.value)}
                        >
                            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                        </SelectField>
                        <TextField
                            label="Perkiraan jumlah tamu"
                            name="guest_estimate"
                            type="number"
                            min={1}
                            hint="Item per tamu (katering, souvenir) dihitung ulang dari angka ini."
                            value={form.data.guest_estimate}
                            error={form.errors.guest_estimate}
                            onChange={(e) => form.setData('guest_estimate', e.target.value === '' ? '' : Number(e.target.value))}
                        />
                        <MoneyField
                            label="Total anggaran"
                            value={form.data.total_budget}
                            error={form.errors.total_budget}
                            hint="Kosongkan bila belum ditentukan."
                            onValueChange={(v) => form.setData('total_budget', v)}
                        />
                        <TextField
                            label="Dana tak terduga (%)"
                            name="contingency_percent"
                            type="number"
                            min={0}
                            max={30}
                            hint="Persentase dari subtotal; umumnya 5–10%."
                            value={form.data.contingency_percent}
                            error={form.errors.contingency_percent}
                            onChange={(e) => form.setData('contingency_percent', Number(e.target.value))}
                        />
                        <TextField
                            label="Buffer kenaikan harga (%)"
                            name="price_buffer_percent"
                            type="number"
                            min={0}
                            max={50}
                            hint="Hanya untuk item yang belum disepakati."
                            value={form.data.price_buffer_percent}
                            error={form.errors.price_buffer_percent}
                            onChange={(e) => form.setData('price_buffer_percent', Number(e.target.value))}
                        />
                        <TextField
                            label="Batas peringatan (%)"
                            name="warning_threshold_percent"
                            type="number"
                            min={50}
                            max={100}
                            hint="Status 'mendekati batas' muncul bila proyeksi mencapai persentase ini dari anggaran."
                            value={form.data.warning_threshold_percent}
                            error={form.errors.warning_threshold_percent}
                            onChange={(e) => form.setData('warning_threshold_percent', Number(e.target.value))}
                        />
                        <fieldset className="grid gap-1 sm:col-span-2">
                            <legend className="mb-1 text-sm font-medium">Dihitung dalam anggaran</legend>
                            <label className="flex min-h-11 items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.include_prewedding}
                                    onChange={(e) => form.setData('include_prewedding', e.target.checked)}
                                    className="accent-brand size-5"
                                />
                                Pre-wedding
                            </label>
                            <label className="flex min-h-11 items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.include_honeymoon}
                                    onChange={(e) => form.setData('include_honeymoon', e.target.checked)}
                                    className="accent-brand size-5"
                                />
                                Honeymoon
                            </label>
                        </fieldset>
                        <div className="sm:col-span-2">
                            <Button type="submit" className="h-11" disabled={form.processing}>
                                {form.processing ? 'Menyimpan…' : 'Simpan pengaturan'}
                            </Button>
                        </div>
                    </form>
                </section>

                <section aria-labelledby="anggota">
                    <SectionHeading
                        id="anggota"
                        number="03"
                        title="Kalian berdua"
                        description="Hanya dua orang yang bisa masuk. Tidak ada pendaftaran publik."
                    />
                    <ul className="divide-line max-w-xl divide-y border-y">
                        {members.map((m) => (
                            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                                <div>
                                    <p className="font-medium">{m.name}</p>
                                    <p className="text-ink-faint text-sm">
                                        {m.email} · {m.role === 'owner' ? 'Pemilik' : 'Pasangan'}
                                    </p>
                                </div>
                                {isOwner && m.role !== 'owner' && (
                                    <Button variant="ghost" size="sm" className="h-11" onClick={() => setRemoving(m.id)}>
                                        Keluarkan
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>

                    {isOwner && (
                        <div className="mt-8 max-w-xl space-y-6">
                            {inviteLink && (
                                <div role="status" className="bg-sage-soft text-sage rounded-md p-4 text-sm">
                                    <p className="font-medium">Tautan undangan (hanya ditampilkan sekali, berlaku 7 hari)</p>
                                    <p className="mt-2 text-xs break-all">{inviteLink}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 h-11"
                                        onClick={() => navigator.clipboard?.writeText(inviteLink)}
                                    >
                                        <Copy className="size-4" strokeWidth={1.5} aria-hidden="true" /> Salin tautan
                                    </Button>
                                </div>
                            )}
                            {members.length < 2 && invitations.length === 0 && (
                                <form onSubmit={invite} noValidate className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
                                    <TextField
                                        label="Undang pasangan lewat email"
                                        name="email"
                                        type="email"
                                        required
                                        value={inviteForm.data.email}
                                        error={inviteForm.errors.email}
                                        onChange={(e) => inviteForm.setData('email', e.target.value)}
                                    />
                                    <Button type="submit" className="h-11" disabled={inviteForm.processing}>
                                        {inviteForm.processing ? 'Membuat…' : 'Buat tautan'}
                                    </Button>
                                </form>
                            )}
                            {invitations.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between gap-3 text-sm">
                                    <p>
                                        Undangan untuk {inv.email} · berlaku s.d. {tanggal(inv.expires_at, { day: 'numeric', month: 'short' })}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-11"
                                        onClick={() => router.delete(`/pengaturan/undangan/${inv.id}`, { preserveScroll: true })}
                                    >
                                        Cabut
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <ConfirmDialog
                open={changes !== null}
                onOpenChange={(o) => !o && setChanges(null)}
                title="Ubah hari H?"
                description={
                    changes && changes.length === 0
                        ? 'Tidak ada tenggat tugas yang berubah.'
                        : `${changes?.length ?? 0} tenggat akan dihitung ulang${rescheduled ? `, ${rescheduled} di antaranya terlambat dan hanya ditandai "perlu dijadwal ulang"` : ''}. Tugas yang selesai atau dikunci tidak berubah.`
                }
                confirmLabel="Simpan hari H baru"
                busy={saving}
                onConfirm={applyDate}
            >
                {changes && changes.length > 0 && (
                    <ul className="divide-line max-h-64 divide-y overflow-y-auto border-y text-sm">
                        {changes.map((c) => (
                            <li key={c.id} className="py-2">
                                <p>{c.title}</p>
                                <p className="num text-ink-soft">
                                    {c.from ? tanggal(c.from, { day: 'numeric', month: 'short', year: 'numeric' }) : 'tanpa tenggat'} →{' '}
                                    {c.to ? tanggal(c.to, { day: 'numeric', month: 'short', year: 'numeric' }) : 'tenggat lama dipertahankan'}
                                    {c.needs_reschedule && (
                                        <span className="text-amber ml-2 inline-flex items-center gap-1">
                                            <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> ideal{' '}
                                            {tanggal(c.ideal, { day: 'numeric', month: 'short', year: 'numeric' })} sudah lewat
                                        </span>
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </ConfirmDialog>

            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(o) => !o && setRemoving(null)}
                title="Keluarkan pasangan?"
                description="Akunnya dihapus dan tidak bisa masuk lagi sampai diundang ulang. Data pernikahan tetap ada."
                confirmLabel="Keluarkan"
                destructive
                onConfirm={() => {
                    if (removing === null) return;
                    router.delete(`/pengaturan/anggota/${removing}`, { preserveScroll: true, onFinish: () => setRemoving(null) });
                }}
            />
        </AppLayout>
    );
}
