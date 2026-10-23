import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { EmptyState } from '@/components/planner/empty-state';
import { PageHeader, SectionHeading } from '@/components/planner/page-header';
import { Button } from '@/components/ui/button';
import { CandidateDialog } from '@/components/vendors/candidate-dialog';
import { MeetingDialog } from '@/components/vendors/meeting-dialog';
import AppLayout from '@/layouts/app-layout';
import { rupiah, tanggal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type CandidateData, type CriterionData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, MessageCircle, NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    slot: {
        id: number;
        name: string;
        need: string;
        estimate: {
            min: number | null;
            max: number | null;
            agreed: number | null;
            per_guest: boolean;
            price_per_guest: number | null;
            mid: number | null;
        } | null;
    };
    guests: number | null;
    criteria: CriterionData[];
    candidates: CandidateData[];
}

const statusLabel: Record<CandidateData['status'], string> = {
    shortlist: 'Shortlist',
    dihubungi: 'Dihubungi',
    survei: 'Sudah survei',
    negosiasi: 'Negosiasi',
    terpilih: 'Terpilih',
    ditolak: 'Ditolak',
};

/** Nomor lokal 08xx diubah ke format internasional untuk wa.me; selain angka dibuang. */
function whatsappUrl(phone: string | null) {
    if (!phone) return null;
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
    return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

export default function VendorShow({ slot, guests, criteria, candidates }: Props) {
    const [editing, setEditing] = useState<{ candidate: CandidateData | null } | null>(null);
    const [meeting, setMeeting] = useState<CandidateData | null>(null);
    const [choosing, setChoosing] = useState<CandidateData | null>(null);
    const [applyPrice, setApplyPrice] = useState(true);
    const [deleting, setDeleting] = useState<CandidateData | null>(null);
    const [compare, setCompare] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);
    const today = new Date().toISOString().slice(0, 10);

    const toggleCompare = (id: number) => setCompare((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < 4 ? [...ids, id] : ids));
    const compared = candidates.filter((c) => compare.includes(c.id));
    const active = candidates.filter((c) => c.status !== 'ditolak');
    const rejected = candidates.filter((c) => c.status === 'ditolak');

    const estimateLine = slot.estimate
        ? slot.estimate.agreed !== null
            ? `Disepakati ${rupiah(slot.estimate.agreed)}`
            : slot.estimate.per_guest
              ? `Estimasi ${rupiah(slot.estimate.price_per_guest)} per tamu × ${guests ?? 0} tamu`
              : slot.estimate.min !== null
                ? `Estimasi ${rupiah(slot.estimate.min)}${slot.estimate.max !== null && slot.estimate.max !== slot.estimate.min ? ` – ${rupiah(slot.estimate.max)}` : ''}`
                : 'Estimasi anggaran belum diisi'
        : 'Slot ini belum terhubung ke item anggaran';

    const renderCandidate = (c: CandidateData) => {
        const wa = whatsappUrl(c.phone);
        return (
            <li key={c.id} className={cn('py-5', c.status === 'terpilih' && 'bg-sage-soft/50 -mx-4 px-4')}>
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <div className="min-w-0">
                        <h3 className="text-xl">{c.name}</h3>
                        <p className="text-ink-soft text-sm">
                            {[c.package_name, c.city, statusLabel[c.status]].filter(Boolean).join(' · ')}
                            {c.source ? ` · dari ${c.source}` : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="num font-display text-2xl">{rupiah(c.quoted_price)}</p>
                        {c.estimate_difference !== null && (
                            <p className={cn('num text-sm', c.estimate_difference > 0 ? 'text-amber' : 'text-sage')}>
                                {c.estimate_difference === 0
                                    ? 'Sama dengan estimasi'
                                    : `${rupiah(Math.abs(c.estimate_difference))} ${c.estimate_difference > 0 ? 'di atas' : 'di bawah'} estimasi`}
                            </p>
                        )}
                    </div>
                </div>

                {(c.inclusions || c.exclusions || c.pros || c.cons || c.notes) && (
                    <dl className="text-ink-soft mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                        {[
                            ['Sudah termasuk', c.inclusions],
                            ['Belum termasuk', c.exclusions],
                            ['Kelebihan', c.pros],
                            ['Kekurangan', c.cons],
                            ['Catatan', c.notes],
                        ].map(([label, value]) =>
                            value ? (
                                <div key={label}>
                                    <dt className="text-ink-faint text-xs tracking-[0.12em] uppercase">{label}</dt>
                                    <dd className="whitespace-pre-line">{value}</dd>
                                </div>
                            ) : null,
                        )}
                    </dl>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {c.weighted_score !== null && <span className="num">Skor tertimbang {c.weighted_score.toLocaleString('id-ID')} / 5</span>}
                    {c.quote_valid_until && (
                        <span className="text-ink-soft">
                            Penawaran berlaku s.d. {tanggal(c.quote_valid_until, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    )}
                    {wa && (
                        <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand inline-flex min-h-11 items-center gap-1 underline underline-offset-4"
                        >
                            <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden="true" /> WhatsApp
                            <span className="sr-only"> {c.name} (tab baru)</span>
                        </a>
                    )}
                    {c.instagram && (
                        <a
                            href={`https://instagram.com/${c.instagram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand inline-flex min-h-11 items-center gap-1 underline underline-offset-4"
                        >
                            <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden="true" /> Instagram
                            <span className="sr-only"> {c.name} (tab baru)</span>
                        </a>
                    )}
                    {c.website && (
                        <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand inline-flex min-h-11 items-center gap-1 underline underline-offset-4"
                        >
                            <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden="true" /> Situs
                            <span className="sr-only"> {c.name} (tab baru)</span>
                        </a>
                    )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {c.status !== 'terpilih' && c.status !== 'ditolak' && (
                        <Button
                            size="sm"
                            className="h-11"
                            onClick={() => {
                                setApplyPrice(c.quoted_price !== null && slot.estimate !== null);
                                setChoosing(c);
                            }}
                        >
                            Pilih vendor ini
                        </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-11" onClick={() => setMeeting(c)}>
                        <NotebookPen className="size-4" strokeWidth={1.5} aria-hidden="true" /> Pertemuan ({c.meetings.length})
                    </Button>
                    <Button variant="ghost" size="sm" className="h-11" onClick={() => setEditing({ candidate: c })}>
                        <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" /> Ubah
                    </Button>
                    <Button variant="ghost" size="sm" className="h-11" onClick={() => setDeleting(c)}>
                        <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" /> Hapus
                    </Button>
                    {c.status !== 'ditolak' && (
                        <label className="ml-auto flex min-h-11 items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={compare.includes(c.id)}
                                disabled={!compare.includes(c.id) && compare.length >= 4}
                                onChange={() => toggleCompare(c.id)}
                                className="accent-brand size-5"
                            />
                            Bandingkan<span className="sr-only"> {c.name}</span>
                        </label>
                    )}
                </div>
            </li>
        );
    };

    return (
        <AppLayout>
            <Head title={slot.name} />

            <div className="space-y-12">
                <div>
                    <Link
                        href="/vendor"
                        className="text-ink-soft mb-4 inline-flex min-h-11 items-center gap-1 text-sm underline-offset-4 hover:underline"
                    >
                        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" /> Semua slot vendor
                    </Link>
                    <PageHeader
                        eyebrow="Slot vendor"
                        title={slot.name}
                        description={estimateLine}
                        actions={
                            <Button className="h-11" onClick={() => setEditing({ candidate: null })}>
                                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Tambah kandidat
                            </Button>
                        }
                    />
                </div>

                {candidates.length === 0 ? (
                    <EmptyState title="Belum ada kandidat">
                        Catat vendor yang kalian temui — dari rekomendasi, wedding fair, atau media sosial — beserta penawarannya.
                    </EmptyState>
                ) : (
                    <section aria-labelledby="kandidat">
                        <SectionHeading
                            id="kandidat"
                            number="01"
                            title="Kandidat"
                            description={`${active.length} aktif${rejected.length ? `, ${rejected.length} ditolak` : ''}`}
                        />
                        <ul className="divide-line divide-y border-y">{active.map(renderCandidate)}</ul>
                    </section>
                )}

                {compared.length >= 2 && (
                    <section aria-labelledby="banding">
                        <SectionHeading
                            id="banding"
                            number="02"
                            title="Perbandingan"
                            description="Skor tertimbang memakai bobot kriteria dan hanya menghitung kriteria yang sudah dinilai."
                        />
                        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                            <table className="w-full min-w-[34rem] text-left text-sm">
                                <caption className="sr-only">
                                    Perbandingan {compared.length} kandidat {slot.name}
                                </caption>
                                <thead>
                                    <tr className="border-line border-b">
                                        <th scope="col" className="sr-only">
                                            Aspek
                                        </th>
                                        {compared.map((c) => (
                                            <th key={c.id} scope="col" className="font-display py-3 pr-4 text-lg font-medium">
                                                {c.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-line divide-y">
                                    {(
                                        [
                                            ['Paket', (c: CandidateData) => c.package_name ?? '—'],
                                            ['Harga penawaran', (c: CandidateData) => rupiah(c.quoted_price)],
                                            [
                                                'Selisih terhadap estimasi',
                                                (c: CandidateData) =>
                                                    c.estimate_difference === null
                                                        ? '—'
                                                        : `${c.estimate_difference > 0 ? '+' : c.estimate_difference < 0 ? '−' : ''}${rupiah(Math.abs(c.estimate_difference))}`,
                                            ],
                                            [
                                                'Skor tertimbang',
                                                (c: CandidateData) =>
                                                    c.weighted_score === null ? '—' : `${c.weighted_score.toLocaleString('id-ID')} / 5`,
                                            ],
                                            ['Termasuk', (c: CandidateData) => c.inclusions ?? '—'],
                                            ['Belum termasuk', (c: CandidateData) => c.exclusions ?? '—'],
                                            ['Kelebihan', (c: CandidateData) => c.pros ?? '—'],
                                            ['Kekurangan', (c: CandidateData) => c.cons ?? '—'],
                                            [
                                                'Berlaku sampai',
                                                (c: CandidateData) =>
                                                    c.quote_valid_until
                                                        ? tanggal(c.quote_valid_until, { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : '—',
                                            ],
                                        ] as [string, (c: CandidateData) => string][]
                                    ).map(([label, value]) => (
                                        <tr key={label}>
                                            <th
                                                scope="row"
                                                className="text-ink-faint w-40 py-3 pr-4 align-top text-xs font-normal tracking-[0.12em] uppercase"
                                            >
                                                {label}
                                            </th>
                                            {compared.map((c) => (
                                                <td key={c.id} className="num py-3 pr-4 align-top whitespace-pre-line">
                                                    {value(c)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {criteria.map((criterion) => (
                                        <tr key={criterion.id}>
                                            <th scope="row" className="text-ink-faint py-3 pr-4 text-xs font-normal tracking-[0.12em] uppercase">
                                                {criterion.name}
                                            </th>
                                            {compared.map((c) => (
                                                <td key={c.id} className="num py-3 pr-4">
                                                    {c.scores[criterion.id] ?? '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
                {compared.length === 1 && (
                    <p className="text-ink-soft text-sm">Pilih satu kandidat lagi (maksimal empat) untuk melihat perbandingan.</p>
                )}

                {rejected.length > 0 && (
                    <section aria-labelledby="ditolak">
                        <SectionHeading id="ditolak" title="Ditolak" />
                        <ul className="divide-line divide-y border-y opacity-80">{rejected.map(renderCandidate)}</ul>
                    </section>
                )}
            </div>

            <CandidateDialog
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                slotId={slot.id}
                candidate={editing?.candidate ?? null}
                criteria={criteria}
            />
            <MeetingDialog
                open={meeting !== null}
                onOpenChange={(o) => !o && setMeeting(null)}
                candidate={candidates.find((c) => c.id === meeting?.id) ?? null}
                slotId={slot.id}
                today={today}
            />

            <ConfirmDialog
                open={choosing !== null}
                onOpenChange={(o) => !o && setChoosing(null)}
                title={`Pilih ${choosing?.name ?? ''} untuk ${slot.name}?`}
                description="Kandidat terpilih sebelumnya (bila ada) kembali ke negosiasi."
                confirmLabel="Pilih vendor ini"
                busy={busy}
                onConfirm={() => {
                    if (!choosing) return;
                    setBusy(true);
                    router.post(
                        `/vendor/kandidat/${choosing.id}/pilih`,
                        { apply_price: applyPrice },
                        {
                            preserveScroll: true,
                            onFinish: () => {
                                setBusy(false);
                                setChoosing(null);
                            },
                        },
                    );
                }}
            >
                {choosing?.quoted_price !== null && slot.estimate && (
                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={applyPrice}
                            onChange={(e) => setApplyPrice(e.target.checked)}
                            className="accent-brand mt-0.5 size-5"
                        />
                        <span>
                            Jadikan {rupiah(choosing?.quoted_price)} sebagai kesepakatan di anggaran
                            {slot.estimate.agreed !== null && <> (menggantikan {rupiah(slot.estimate.agreed)})</>}.
                        </span>
                    </label>
                )}
            </ConfirmDialog>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title={`Hapus kandidat ${deleting?.name ?? ''}?`}
                description="Catatan pertemuan dan skornya ikut terhapus."
                confirmLabel="Hapus"
                destructive
                busy={busy}
                onConfirm={() => {
                    if (!deleting) return;
                    setBusy(true);
                    router.delete(`/vendor/kandidat/${deleting.id}`, {
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
