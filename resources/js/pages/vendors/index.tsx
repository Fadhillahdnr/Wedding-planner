import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { EmptyState } from '@/components/planner/empty-state';
import { SelectField, TextField } from '@/components/planner/field';
import { PageHeader, SectionHeading } from '@/components/planner/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import { type VendorSlotRow } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Props {
    slots: VendorSlotRow[];
    statusLabels: Record<string, string>;
}

const groups: { need: VendorSlotRow['need']; title: string; note: string }[] = [
    { need: 'needed', title: 'Dibutuhkan', note: 'Slot yang harus terisi sebelum hari H.' },
    { need: 'optional', title: 'Opsional', note: 'Dipertimbangkan bila anggaran dan waktunya cukup.' },
    { need: 'not_needed', title: 'Tidak dibutuhkan', note: 'Disimpan agar bisa diaktifkan lagi.' },
];

const statusTone = (status: string) =>
    ['terpilih', 'dp_dibayar', 'lunas'].includes(status)
        ? 'bg-sage-soft text-sage'
        : status === 'belum_dicari'
          ? 'bg-sunk text-ink-soft'
          : 'bg-amber-soft text-amber';

export default function VendorsIndex({ slots, statusLabels }: Props) {
    const form = useForm({ name: '', need: 'needed' });
    const [deleting, setDeleting] = useState<VendorSlotRow | null>(null);
    const [busy, setBusy] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/vendor/slot', { preserveScroll: true, onSuccess: () => form.reset('name') });
    };

    const setNeed = (slot: VendorSlotRow, need: string) => router.put(`/vendor/slot/${slot.id}`, { name: slot.name, need }, { preserveScroll: true });

    return (
        <AppLayout>
            <Head title="Vendor" />

            <div className="space-y-14">
                <PageHeader
                    eyebrow="Orang-orang"
                    title="Vendor"
                    description="Satu slot untuk tiap kebutuhan. Status slot dibaca dari kandidat dan pembayarannya — tidak perlu diisi manual."
                />

                <form onSubmit={submit} noValidate className="grid items-end gap-4 sm:grid-cols-[1fr_12rem_auto]">
                    <TextField
                        label="Tambah slot vendor"
                        name="name"
                        placeholder="mis. Penyewaan tenda"
                        value={form.data.name}
                        error={form.errors.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                    <SelectField label="Kebutuhan" name="need" value={form.data.need} onChange={(e) => form.setData('need', e.target.value)}>
                        <option value="needed">Dibutuhkan</option>
                        <option value="optional">Opsional</option>
                    </SelectField>
                    <Button type="submit" className="h-11" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Tambah'}
                    </Button>
                </form>

                {slots.length === 0 && (
                    <EmptyState title="Belum ada slot vendor">
                        Selesaikan onboarding untuk memuat template slot, atau tambahkan slot pertama di atas.
                    </EmptyState>
                )}

                {groups.map((group, index) => {
                    const list = slots.filter((s) => s.need === group.need);
                    if (list.length === 0) return null;
                    return (
                        <section key={group.need} aria-labelledby={`g-${group.need}`}>
                            <SectionHeading
                                id={`g-${group.need}`}
                                number={String(index + 1).padStart(2, '0')}
                                title={group.title}
                                description={group.note}
                            />
                            <ul className="divide-line divide-y border-y">
                                {list.map((slot) => (
                                    <li key={slot.id} className="grid items-center gap-x-4 gap-y-2 py-3 md:grid-cols-[1.4fr_1fr_1fr_10rem_3rem]">
                                        <Link href={`/vendor/slot/${slot.id}`} className="font-medium underline-offset-4 hover:underline">
                                            {slot.name}
                                        </Link>
                                        <p>
                                            <span className={`inline-block rounded-full px-3 py-1 text-sm ${statusTone(slot.status)}`}>
                                                {statusLabels[slot.status] ?? slot.status}
                                            </span>
                                        </p>
                                        <p className="num text-ink-soft text-sm">
                                            {slot.chosen
                                                ? `${slot.chosen.name}${slot.chosen.quoted_price !== null ? ` · ${rupiah(slot.chosen.quoted_price)}` : ''}`
                                                : `${slot.candidate_count} kandidat`}
                                        </p>
                                        <select
                                            aria-label={`Kebutuhan ${slot.name}`}
                                            value={slot.need}
                                            onChange={(e) => setNeed(slot, e.target.value)}
                                            className="border-input bg-card h-11 rounded-md border px-2 text-sm"
                                        >
                                            <option value="needed">Dibutuhkan</option>
                                            <option value="optional">Opsional</option>
                                            <option value="not_needed">Tidak dibutuhkan</option>
                                        </select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11 justify-self-end"
                                            aria-label={`Hapus slot ${slot.name}`}
                                            onClick={() => setDeleting(slot)}
                                        >
                                            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title={`Hapus slot ${deleting?.name ?? ''}?`}
                description={deleting && deleting.candidate_count > 0 ? `${deleting.candidate_count} kandidat di dalamnya ikut terhapus.` : undefined}
                confirmLabel="Hapus"
                destructive
                busy={busy}
                onConfirm={() => {
                    if (!deleting) return;
                    setBusy(true);
                    router.delete(`/vendor/slot/${deleting.id}`, {
                        preserveScroll: true,
                        onFinish: () => {
                            setBusy(false);
                            setDeleting(null);
                        },
                    });
                }}
            />
        </AppLayout>
    );
}
