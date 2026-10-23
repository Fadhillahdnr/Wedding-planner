import { ItemDialog } from '@/components/budget/item-dialog';
import { CategoryDialog, FundingDialog, PaymentDialog } from '@/components/budget/simple-dialogs';
import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { EmptyState } from '@/components/planner/empty-state';
import { MoneyFigure } from '@/components/planner/money-figure';
import { PageHeader, SectionHeading } from '@/components/planner/page-header';
import { ProgressRule } from '@/components/planner/progress-rule';
import { StatusBadge, type BudgetStatusValue } from '@/components/planner/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { bulan, rupiah, tanggal } from '@/lib/format';
import { type BudgetCategoryData, type BudgetItemData, type BudgetPlan, type FundingData, type PaymentData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    summary: {
        projected_total: number;
        subtotal: number;
        contingency: number;
        agreed_total: number;
        paid_total: number;
        remaining_to_pay: number;
        total_budget: number | null;
        variance: number | null;
        status_value: BudgetStatusValue;
        status_label: string;
        projected_range: { min: number; max: number };
    };
    categories: BudgetCategoryData[];
    funding: FundingData[];
    plan: BudgetPlan;
    payments: PaymentData[];
    wedding: { guest_estimate: number | null; total_budget: number | null; contingency_percent: number; price_buffer_percent: number };
}

type Deletion = { url: string; title: string; description: string } | null;

const paymentLabel: Record<PaymentData['status'], string> = {
    direncanakan: 'Direncanakan',
    jatuh_tempo: 'Jatuh tempo',
    lunas: 'Lunas',
    dibatalkan: 'Dibatalkan',
};

function estimateText(item: BudgetItemData, guests: number | null) {
    if (item.pricing_mode === 'per_guest') {
        return item.price_per_guest ? `${rupiah(item.price_per_guest)} × ${guests ?? 0} tamu` : '—';
    }
    if (item.estimate_min === null && item.estimate_max === null) return '—';
    if (item.estimate_min !== null && item.estimate_max !== null && item.estimate_min !== item.estimate_max) {
        return `${rupiah(item.estimate_min)} – ${rupiah(item.estimate_max)}`;
    }
    return rupiah(item.estimate_min ?? item.estimate_max);
}

export default function BudgetIndex({ summary, categories, funding, plan, payments, wedding }: Props) {
    const [itemDialog, setItemDialog] = useState<{ categoryId: number; item: BudgetItemData | null } | null>(null);
    const [categoryDialog, setCategoryDialog] = useState<{ record: BudgetCategoryData | null } | null>(null);
    const [fundingDialog, setFundingDialog] = useState<{ record: FundingData | null } | null>(null);
    const [paymentDialog, setPaymentDialog] = useState<{ record: PaymentData | null } | null>(null);
    const [deletion, setDeletion] = useState<Deletion>(null);
    const [deleting, setDeleting] = useState(false);

    const allItems = categories.flatMap((c) => c.items.map((i) => ({ id: i.id, name: `${c.name} — ${i.name}` })));
    const overpaid = categories.flatMap((c) => c.items.filter((i) => i.overpaid));

    const confirmDelete = () => {
        if (!deletion) return;
        setDeleting(true);
        router.delete(deletion.url, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeletion(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Anggaran" />

            <div className="space-y-16">
                <PageHeader
                    eyebrow="Uang"
                    title="Anggaran"
                    description={
                        <>
                            Tiga angka dipisahkan: <strong className="font-medium">estimasi</strong> (rencana),{' '}
                            <strong className="font-medium">kesepakatan</strong> (harga yang sudah disetujui), dan{' '}
                            <strong className="font-medium">terbayar</strong>.
                        </>
                    }
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/pengaturan/pernikahan">Atur total, tamu &amp; dana tak terduga</Link>
                        </Button>
                    }
                />

                <section aria-labelledby="ringkasan">
                    <h2 id="ringkasan" className="sr-only">
                        Ringkasan angka
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
                        <MoneyFigure
                            size="lg"
                            label="Proyeksi total"
                            value={summary.projected_total}
                            note={`Termasuk dana tak terduga ${wedding.contingency_percent}% (${rupiah(summary.contingency)})${wedding.price_buffer_percent ? ` dan buffer harga ${wedding.price_buffer_percent}%` : ''}`}
                        />
                        <MoneyFigure label="Disepakati" value={summary.agreed_total} note={`Sisa dibayar ${rupiah(summary.remaining_to_pay)}`} />
                        <MoneyFigure label="Terbayar" value={summary.paid_total} />
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <StatusBadge status={summary.status_value} label={summary.status_label} />
                        {summary.total_budget !== null && summary.variance !== null ? (
                            <p className="text-ink-soft text-sm">
                                {summary.variance >= 0
                                    ? `Sisa ruang dari ${rupiah(summary.total_budget)}: ${rupiah(summary.variance)}`
                                    : `Lebih ${rupiah(-summary.variance)} dari anggaran ${rupiah(summary.total_budget)}`}
                            </p>
                        ) : (
                            <p className="text-ink-soft text-sm">Total anggaran belum diatur; angka di atas dihitung dari item yang diisi.</p>
                        )}
                        {summary.projected_range.min !== summary.projected_range.max && (
                            <p className="text-ink-faint num text-sm">
                                Rentang item: {rupiah(summary.projected_range.min)} – {rupiah(summary.projected_range.max)}
                            </p>
                        )}
                    </div>
                    {overpaid.length > 0 && (
                        <p role="alert" className="bg-amber-soft text-amber mt-4 flex items-start gap-2 rounded-md px-4 py-3 text-sm">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                            Pembayaran melebihi kesepakatan pada: {overpaid.map((i) => i.name).join(', ')}.
                        </p>
                    )}
                </section>

                <section aria-labelledby="rincian">
                    <SectionHeading
                        id="rincian"
                        number="01"
                        title="Rincian per kategori"
                        description="Template umum — sesuaikan nama, alokasi, dan item dengan kebutuhan kalian."
                        actions={
                            <Button size="sm" variant="outline" className="h-11" onClick={() => setCategoryDialog({ record: null })}>
                                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Kategori
                            </Button>
                        }
                    />

                    {categories.length === 0 ? (
                        <EmptyState title="Belum ada kategori">Tambahkan kategori pertama, misalnya venue atau dokumentasi.</EmptyState>
                    ) : (
                        <div className="space-y-12">
                            {categories.map((category) => (
                                <div key={category.id}>
                                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                                        <h3 className="text-xl">{category.name}</h3>
                                        <div className="flex items-center gap-1">
                                            <p className="num text-ink-soft mr-3 text-sm">
                                                Proyeksi {rupiah(category.projected)}
                                                {category.allocated_amount > 0 && <> dari alokasi {rupiah(category.allocated_amount)}</>}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-11"
                                                aria-label={`Ubah kategori ${category.name}`}
                                                onClick={() => setCategoryDialog({ record: category })}
                                            >
                                                <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-11"
                                                aria-label={`Hapus kategori ${category.name}`}
                                                onClick={() =>
                                                    setDeletion({
                                                        url: `/anggaran/kategori/${category.id}`,
                                                        title: `Hapus kategori ${category.name}?`,
                                                        description: `${category.items.length} item di dalamnya ikut terhapus, termasuk jadwal pembayarannya.`,
                                                    })
                                                }
                                            >
                                                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>

                                    {category.allocated_amount > 0 && (
                                        <ProgressRule
                                            value={category.projected}
                                            max={category.allocated_amount}
                                            tone={category.projected > category.allocated_amount ? 'danger' : 'sage'}
                                            label={`Proyeksi ${category.name} terhadap alokasi`}
                                            className="mb-2"
                                        />
                                    )}

                                    <div className="text-ink-faint hidden grid-cols-[1fr_11rem_9rem_9rem_6rem] gap-4 px-1 py-2 text-xs tracking-[0.12em] uppercase md:grid">
                                        <span>Item</span>
                                        <span className="text-right">Estimasi</span>
                                        <span className="text-right">Kesepakatan</span>
                                        <span className="text-right">Terbayar</span>
                                        <span className="sr-only">Aksi</span>
                                    </div>
                                    <ul className="divide-line divide-y border-y">
                                        {category.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="grid gap-x-4 gap-y-1 px-1 py-3 md:grid-cols-[1fr_11rem_9rem_9rem_6rem] md:items-center"
                                            >
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.notes && <p className="text-ink-faint text-sm">{item.notes}</p>}
                                                </div>
                                                <p className="num text-ink-soft text-sm md:text-right">
                                                    <span className="text-ink-faint md:sr-only">Estimasi: </span>
                                                    {estimateText(item, wedding.guest_estimate)}
                                                </p>
                                                <p className="num text-sm md:text-right">
                                                    <span className="text-ink-faint md:sr-only">Kesepakatan: </span>
                                                    {rupiah(item.agreed_amount)}
                                                </p>
                                                <p className={`num text-sm md:text-right ${item.overpaid ? 'text-amber font-medium' : ''}`}>
                                                    <span className="text-ink-faint md:sr-only">Terbayar: </span>
                                                    {rupiah(item.paid)}
                                                </p>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-11"
                                                        aria-label={`Ubah ${item.name}`}
                                                        onClick={() => setItemDialog({ categoryId: category.id, item })}
                                                    >
                                                        <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-11"
                                                        aria-label={`Hapus ${item.name}`}
                                                        onClick={() =>
                                                            setDeletion({
                                                                url: `/anggaran/item/${item.id}`,
                                                                title: `Hapus ${item.name}?`,
                                                                description: 'Jadwal pembayaran item ini ikut terhapus.',
                                                            })
                                                        }
                                                    >
                                                        <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-11"
                                        onClick={() => setItemDialog({ categoryId: category.id, item: null })}
                                    >
                                        <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Tambah item di {category.name}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section aria-labelledby="dana">
                    <SectionHeading
                        id="dana"
                        number="02"
                        title="Sumber dana & tabungan"
                        actions={
                            <Button size="sm" variant="outline" className="h-11" onClick={() => setFundingDialog({ record: null })}>
                                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Sumber dana
                            </Button>
                        }
                    />
                    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                        <div>
                            {funding.length === 0 ? (
                                <EmptyState title="Belum ada sumber dana">
                                    Catat tabungan, bantuan keluarga, atau bonus agar kebutuhan per bulan bisa dihitung.
                                </EmptyState>
                            ) : (
                                <ul className="divide-line divide-y border-y">
                                    {funding.map((source) => (
                                        <li key={source.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                            <div>
                                                <p className="font-medium">{source.name}</p>
                                                <p className="num text-ink-soft text-sm">
                                                    Terkumpul {rupiah(source.collected_amount)}
                                                    {source.target_amount ? ` dari ${rupiah(source.target_amount)}` : ''} ·{' '}
                                                    {rupiah(source.monthly_contribution)} / bulan
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-11"
                                                    aria-label={`Ubah ${source.name}`}
                                                    onClick={() => setFundingDialog({ record: source })}
                                                >
                                                    <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-11"
                                                    aria-label={`Hapus ${source.name}`}
                                                    onClick={() =>
                                                        setDeletion({
                                                            url: `/anggaran/dana/${source.id}`,
                                                            title: `Hapus ${source.name}?`,
                                                            description: 'Perhitungan tabungan per bulan akan berubah.',
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="space-y-3">
                            <MoneyFigure label="Perlu disiapkan lagi" value={plan.need} />
                            {plan.required_per_month !== null ? (
                                <>
                                    <p className="num">
                                        Butuh <strong className="font-medium">{rupiah(plan.required_per_month)}</strong> per bulan
                                        {plan.months_left ? ` selama ${plan.months_left} bulan` : ''}.
                                    </p>
                                    <p className={plan.on_track ? 'text-sage' : 'text-amber'}>
                                        {plan.on_track
                                            ? `Setoran ${rupiah(plan.planned_per_month)} per bulan sudah sesuai jalur.`
                                            : `Setoran sekarang ${rupiah(plan.planned_per_month)} — kurang ${rupiah(plan.shortfall_per_month)} per bulan.`}
                                    </p>
                                </>
                            ) : (
                                <p className="text-ink-soft text-sm">
                                    Atur perkiraan bulan hari H di Pengaturan untuk menghitung kebutuhan per bulan.
                                </p>
                            )}
                            {plan.meet_date && plan.need > 0 && (
                                <p className="text-ink-soft text-sm">
                                    Titik temu: dana mencukupi sekitar {bulan(plan.meet_date.slice(0, 7))}
                                    {plan.meets_before_event === false ? ', setelah hari H.' : '.'}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section id="pembayaran" aria-labelledby="bayar" className="scroll-mt-24">
                    <SectionHeading
                        id="bayar"
                        number="03"
                        title="Jadwal pembayaran"
                        actions={
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-11"
                                disabled={allItems.length === 0}
                                onClick={() => setPaymentDialog({ record: null })}
                            >
                                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Catat pembayaran
                            </Button>
                        }
                    />
                    {payments.length === 0 ? (
                        <EmptyState title="Belum ada pembayaran tercatat">
                            Catat DP, termin, dan pelunasan; item yang lunas otomatis masuk ke angka Terbayar.
                        </EmptyState>
                    ) : (
                        <ul className="divide-line divide-y border-y">
                            {payments.map((p) => (
                                <li key={p.id} className="grid gap-x-4 gap-y-1 py-3 md:grid-cols-[1fr_9rem_10rem_7rem] md:items-center">
                                    <div>
                                        <p className="font-medium">{p.label}</p>
                                        <p className="text-ink-faint text-sm">{p.item}</p>
                                    </div>
                                    <p className="num md:text-right">{rupiah(p.amount)}</p>
                                    <p className="text-ink-soft text-sm">
                                        {paymentLabel[p.status]}
                                        {p.status === 'lunas'
                                            ? ` · ${tanggal(p.paid_on, { day: 'numeric', month: 'short' })}`
                                            : p.due_date
                                              ? ` · ${tanggal(p.due_date, { day: 'numeric', month: 'short', year: 'numeric' })}`
                                              : ''}
                                    </p>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11"
                                            aria-label={`Ubah pembayaran ${p.label}`}
                                            onClick={() => setPaymentDialog({ record: p })}
                                        >
                                            <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11"
                                            aria-label={`Hapus pembayaran ${p.label}`}
                                            onClick={() =>
                                                setDeletion({
                                                    url: `/anggaran/pembayaran/${p.id}`,
                                                    title: `Hapus pembayaran ${p.label}?`,
                                                    description: 'Angka Terbayar akan dihitung ulang.',
                                                })
                                            }
                                        >
                                            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <ItemDialog
                open={itemDialog !== null}
                onOpenChange={(open) => !open && setItemDialog(null)}
                categoryId={itemDialog?.categoryId ?? 0}
                item={itemDialog?.item ?? null}
                guests={wedding.guest_estimate}
            />
            <CategoryDialog
                open={categoryDialog !== null}
                onOpenChange={(open) => !open && setCategoryDialog(null)}
                record={categoryDialog?.record ?? null}
            />
            <FundingDialog
                open={fundingDialog !== null}
                onOpenChange={(open) => !open && setFundingDialog(null)}
                record={fundingDialog?.record ?? null}
            />
            <PaymentDialog
                open={paymentDialog !== null}
                onOpenChange={(open) => !open && setPaymentDialog(null)}
                record={paymentDialog?.record ?? null}
                items={allItems}
            />
            <ConfirmDialog
                open={deletion !== null}
                onOpenChange={(open) => !open && setDeletion(null)}
                title={deletion?.title ?? ''}
                description={deletion?.description}
                confirmLabel="Hapus"
                destructive
                busy={deleting}
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
