import { EmptyState } from '@/components/planner/empty-state';
import { SectionHeading } from '@/components/planner/page-header';
import { ProgressRule } from '@/components/planner/progress-rule';
import { StatusBadge, type BudgetStatusValue } from '@/components/planner/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { bulan, relatif, rupiah, tanggal } from '@/lib/format';
import { type BudgetPlan } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface DatedItem {
    id: number;
    title: string;
    due_date: string | null;
}

interface Props {
    wedding: {
        couple: string;
        target_date: string | null;
        target_month: string | null;
        estimated: boolean;
        days_left: number | null;
        guest_estimate: number | null;
    };
    budget: {
        summary: {
            projected_total: number;
            agreed_total: number;
            paid_total: number;
            remaining_to_pay: number;
            total_budget: number | null;
            variance: number | null;
            status_value: BudgetStatusValue;
            status_label: string;
        };
        plan: BudgetPlan;
        has_items: boolean;
    };
    attention: {
        overdue: DatedItem[];
        this_week: DatedItem[];
        payments: { id: number; label: string; item: string | null; amount: number; due_date: string | null }[];
        late_slots: { id: number; name: string }[];
    };
    phases: { number: number; name: string; done: number; total: number }[];
}

/** Hitung mundur dalam satuan yang paling mudah dibayangkan; perkiraan diberi tanda "±". */
function countdown(daysLeft: number, estimated: boolean) {
    const prefix = estimated ? '±' : '';
    if (daysLeft >= 60) return { value: `${prefix}${Math.round(daysLeft / 30.4)}`, unit: 'bulan lagi' };
    if (daysLeft >= 14) return { value: `${prefix}${Math.round(daysLeft / 7)}`, unit: 'minggu lagi' };
    if (daysLeft > 0) return { value: `${daysLeft}`, unit: 'hari lagi' };
    if (daysLeft === 0) return { value: 'Hari ini', unit: '' };
    return { value: `${-daysLeft}`, unit: 'hari sejak hari H' };
}

function savingsSentence(plan: BudgetPlan) {
    if (plan.need === 0) return 'Dana yang terkumpul sudah mencukupi proyeksi saat ini.';
    if (plan.required_per_month === null) return 'Tentukan tanggal atau perkiraan bulan hari H agar kebutuhan tabungan per bulan bisa dihitung.';
    if (plan.event_passed) return `Masih ada ${rupiah(plan.need)} yang perlu disiapkan.`;
    if (plan.on_track) return `Setoran ${rupiah(plan.planned_per_month)} per bulan sudah cukup; kebutuhannya ${rupiah(plan.required_per_month)}.`;
    return `Butuh ${rupiah(plan.required_per_month)} per bulan, setoran sekarang ${rupiah(plan.planned_per_month)} — kurang ${rupiah(plan.shortfall_per_month)}.`;
}

export default function Dashboard({ wedding, budget, attention, phases }: Props) {
    const { summary, plan } = budget;
    const today = new Date().toISOString().slice(0, 10);
    const currentPhase = phases.find((p) => p.total > 0 && p.done < p.total);
    const count = wedding.days_left !== null ? countdown(wedding.days_left, wedding.estimated) : null;
    const nothingPending = attention.overdue.length + attention.this_week.length + attention.payments.length + attention.late_slots.length === 0;

    return (
        <AppLayout>
            <Head title="Ringkasan" />

            <div className="space-y-16">
                <section aria-labelledby="hari-h" className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
                    <div>
                        <p className="text-ink-faint text-xs tracking-[0.14em] uppercase">{wedding.couple}</p>
                        <h1 id="hari-h" className="sr-only">
                            Ringkasan persiapan
                        </h1>
                        {count ? (
                            <>
                                <p className="font-display num mt-3 text-7xl leading-none font-medium sm:text-8xl">{count.value}</p>
                                <p className="text-ink-soft mt-3 text-xl">{count.unit}</p>
                                <p className="text-ink-faint mt-2 text-sm">
                                    {wedding.estimated ? `Perkiraan ${bulan(wedding.target_month)}` : tanggal(wedding.target_date)}
                                </p>
                            </>
                        ) : (
                            <div className="mt-4">
                                <EmptyState
                                    title="Hari H belum diperkirakan"
                                    action={
                                        <Button asChild variant="outline">
                                            <Link href="/pengaturan/pernikahan">Pilih perkiraan bulan</Link>
                                        </Button>
                                    }
                                >
                                    Dengan perkiraan bulan saja, countdown dan semua tenggat tugas sudah bisa dihitung.
                                </EmptyState>
                            </div>
                        )}
                    </div>

                    {currentPhase && (
                        <div>
                            <p className="text-ink-faint text-xs tracking-[0.14em] uppercase">Fase sekarang</p>
                            <p className="font-display mt-1 text-2xl">
                                <span className="num text-ink-faint">{String(currentPhase.number).padStart(2, '0')}</span> {currentPhase.name}
                            </p>
                            <ProgressRule
                                value={currentPhase.done}
                                max={currentPhase.total}
                                label={`Progres fase ${currentPhase.name}`}
                                className="mt-3"
                            />
                            <p className="text-ink-soft num mt-2 text-sm">
                                {currentPhase.done} dari {currentPhase.total} tugas selesai
                            </p>
                        </div>
                    )}
                </section>

                <section aria-labelledby="uang">
                    <SectionHeading
                        id="uang"
                        number="01"
                        title="Uang"
                        actions={
                            <Button asChild variant="ghost" size="sm" className="h-11">
                                <Link href="/anggaran">Buka anggaran</Link>
                            </Button>
                        }
                    />

                    {!budget.has_items && summary.projected_total === 0 ? (
                        <EmptyState
                            title="Belum ada angka untuk dihitung"
                            action={
                                <Button asChild variant="outline">
                                    <Link href="/anggaran">Isi estimasi pertama</Link>
                                </Button>
                            }
                        >
                            Mulai dengan perkiraan jumlah tamu atau estimasi venue; ringkasan ini akan terisi dari angka yang kalian masukkan.
                        </EmptyState>
                    ) : (
                        <>
                            <dl className="divide-line grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                                {[
                                    ['Proyeksi total', summary.projected_total, 'Estimasi + kesepakatan + dana tak terduga'],
                                    ['Sudah disepakati', summary.agreed_total, 'Harga yang sudah dikunci dengan vendor'],
                                    ['Sudah dibayar', summary.paid_total, `Sisa pembayaran ${rupiah(summary.remaining_to_pay)}`],
                                ].map(([label, value, note]) => (
                                    <div key={label as string} className="py-4 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0">
                                        <dt className="text-ink-faint text-xs tracking-[0.14em] uppercase">{label}</dt>
                                        <dd className="num font-display mt-1 text-3xl font-medium">{rupiah(value as number)}</dd>
                                        <p className="text-ink-soft mt-1 text-sm">{note}</p>
                                    </div>
                                ))}
                            </dl>

                            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                                <StatusBadge status={summary.status_value} label={summary.status_label} />
                                {summary.total_budget !== null && summary.variance !== null && (
                                    <p className="text-ink-soft text-sm">
                                        {summary.variance >= 0
                                            ? `Sisa ruang dari anggaran ${rupiah(summary.total_budget)}: ${rupiah(summary.variance)}.`
                                            : `Melebihi anggaran ${rupiah(summary.total_budget)} sebesar ${rupiah(-summary.variance)}.`}
                                    </p>
                                )}
                            </div>
                            <p className="mt-4 max-w-prose">{savingsSentence(plan)}</p>
                            {plan.meet_date && plan.need > 0 && (
                                <p className="text-ink-soft mt-1 text-sm">
                                    Dengan setoran sekarang, dana mencukupi sekitar {bulan(plan.meet_date.slice(0, 7))}
                                    {plan.meets_before_event === false ? ' — setelah hari H.' : '.'}
                                </p>
                            )}
                        </>
                    )}
                </section>

                <section aria-labelledby="perhatian">
                    <SectionHeading id="perhatian" number="02" title="Perlu perhatian" />

                    {nothingPending ? (
                        <p className="text-ink-soft">Tidak ada yang terlambat atau jatuh tempo dalam waktu dekat.</p>
                    ) : (
                        <ul className="divide-line divide-y">
                            {attention.overdue.map((t) => (
                                <li key={`o${t.id}`} className="flex flex-wrap justify-between gap-2 py-3">
                                    <span>{t.title}</span>
                                    <span className="text-danger text-sm">{relatif(t.due_date, today)}</span>
                                </li>
                            ))}
                            {attention.payments.map((p) => (
                                <li key={`p${p.id}`} className="flex flex-wrap justify-between gap-2 py-3">
                                    <span>
                                        {p.label}
                                        {p.item ? ` — ${p.item}` : ''} <span className="num text-ink-soft">({rupiah(p.amount)})</span>
                                    </span>
                                    <span className="text-amber num text-sm">{relatif(p.due_date, today)}</span>
                                </li>
                            ))}
                            {attention.late_slots.map((s) => (
                                <li key={`s${s.id}`} className="flex flex-wrap justify-between gap-2 py-3">
                                    <Link href={`/vendor/slot/${s.id}`} className="underline underline-offset-4">
                                        {s.name}
                                    </Link>
                                    <span className="text-amber text-sm">belum dipilih, sudah lewat waktu idealnya</span>
                                </li>
                            ))}
                            {attention.this_week.map((t) => (
                                <li key={`w${t.id}`} className="flex flex-wrap justify-between gap-2 py-3">
                                    <span>{t.title}</span>
                                    <span className="text-ink-soft text-sm">{relatif(t.due_date, today)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section aria-labelledby="pintasan">
                    <h2 id="pintasan" className="sr-only">
                        Pintasan
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg" className="h-12">
                            <Link href="/vendor">
                                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Tambah kandidat vendor
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12">
                            <Link href="/anggaran#pembayaran">Catat pembayaran</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12">
                            <Link href="/timeline#tambah">Tambah tugas</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
