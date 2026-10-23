import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { EmptyState } from '@/components/planner/empty-state';
import { TextField } from '@/components/planner/field';
import { PageHeader, SectionHeading } from '@/components/planner/page-header';
import { ProgressRule } from '@/components/planner/progress-rule';
import { TaskDialog } from '@/components/timeline/task-dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { relatif, tanggal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type TaskItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Lock, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

interface Props {
    tasks: TaskItem[];
    phases: { number: number; name: string }[];
    members: { id: number; name: string }[];
    slots: { id: number; name: string }[];
    today: string;
    templateLabel: string;
}

type View = 'roadmap' | 'kalender' | 'fokus';

const views: { value: View; label: string }[] = [
    { value: 'roadmap', label: 'Roadmap' },
    { value: 'kalender', label: 'Kalender' },
    { value: 'fokus', label: 'Fokus' },
];

const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

const isOpen = (t: TaskItem) => t.status === 'belum' || t.status === 'dikerjakan';

/** PUT penuh: validasi server mewajibkan judul, jadi setiap perubahan mengirim seluruh field tugas. */
function save(task: TaskItem, patch: Partial<Record<string, unknown>>) {
    router.put(
        `/timeline/tugas/${task.id}`,
        {
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            status: task.status,
            priority: task.priority,
            assignee_id: task.assignee_id,
            vendor_slot_id: task.vendor_slot_id,
            date_locked: task.date_locked,
            ...patch,
        },
        { preserveScroll: true },
    );
}

function TaskRow({ task, today, onEdit, onDelete }: { task: TaskItem; today: string; onEdit: () => void; onDelete: () => void }) {
    const done = task.status === 'selesai';
    const late = isOpen(task) && task.due_date !== null && task.due_date < today;

    return (
        <li className="flex items-start gap-3 py-2">
            <label className="flex min-h-11 min-w-11 items-center justify-center">
                <input
                    type="checkbox"
                    checked={done}
                    aria-label={`Tandai selesai: ${task.title}`}
                    onChange={() => save(task, { status: done ? 'belum' : 'selesai' })}
                    className="accent-brand size-5"
                />
            </label>
            <div className="min-w-0 flex-1 py-2">
                <p className={cn(done && 'text-ink-faint line-through', task.status === 'dilewati' && 'text-ink-faint italic')}>{task.title}</p>
                <p className="text-ink-faint mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className={cn('num', late && 'text-danger')}>
                        {task.due_date
                            ? `${tanggal(task.due_date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${relatif(task.due_date, today)}`
                            : 'Tanpa tenggat'}
                    </span>
                    {task.date_locked && (
                        <span className="inline-flex items-center gap-1">
                            <Lock className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> terkunci
                        </span>
                    )}
                    {task.needs_reschedule && (
                        <span className="text-amber inline-flex items-center gap-1">
                            <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> perlu dijadwal ulang
                        </span>
                    )}
                    {task.status === 'dikerjakan' && <span>sedang dikerjakan</span>}
                    {task.priority === 'tinggi' && <span className="text-brand">prioritas tinggi</span>}
                    {task.assignee && <span>{task.assignee}</span>}
                </p>
            </div>
            <Button variant="ghost" size="icon" className="size-11" aria-label={`Ubah ${task.title}`} onClick={onEdit}>
                <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label={`Hapus ${task.title}`} onClick={onDelete}>
                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>
        </li>
    );
}

export default function Timeline({ tasks, phases, members, slots, today, templateLabel }: Props) {
    const [view, setView] = useState<View>('roadmap');
    const [month, setMonth] = useState(today.slice(0, 7));
    const [editing, setEditing] = useState<TaskItem | null>(null);
    const [deleting, setDeleting] = useState<TaskItem | null>(null);
    const [busy, setBusy] = useState(false);

    const add = useForm({ title: '', due_date: '' });
    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();
        add.post('/timeline/tugas', { preserveScroll: true, onSuccess: () => add.reset() });
    };

    const rowProps = (t: TaskItem) => ({ task: t, today, onEdit: () => setEditing(t), onDelete: () => setDeleting(t) });

    const byPhase = useMemo(() => {
        const map = new Map<number | null, TaskItem[]>();
        tasks.forEach((t) => map.set(t.phase, [...(map.get(t.phase) ?? []), t]));
        return map;
    }, [tasks]);

    const monthTasks = tasks.filter((t) => t.due_date?.startsWith(month));
    const [year, mon] = month.split('-').map(Number);
    const firstWeekday = (new Date(year, mon - 1, 1).getDay() + 6) % 7; // Senin = 0
    const daysInMonth = new Date(year, mon, 0).getDate();
    const shift = (delta: number) => {
        const d = new Date(year, mon - 1 + delta, 1);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const weekEnd = new Date(`${today}T12:00:00`);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndIso = weekEnd.toISOString().slice(0, 10);
    const open = tasks.filter(isOpen);
    const focus = {
        late: open.filter((t) => t.due_date && t.due_date < today),
        week: open.filter((t) => t.due_date && t.due_date >= today && t.due_date <= weekEndIso),
        month: open.filter((t) => t.due_date && t.due_date > weekEndIso && t.due_date.startsWith(today.slice(0, 7))),
        resched: open.filter((t) => t.needs_reschedule),
    };

    return (
        <AppLayout>
            <Head title="Timeline" />

            <div className="space-y-12">
                <PageHeader
                    eyebrow="Waktu"
                    title="Timeline"
                    description="Tenggat tugas template dihitung dari hari H. Saat hari H berubah, kamu melihat pratinjau perubahannya dulu sebelum disimpan."
                />

                <div role="group" aria-label="Tampilan timeline" className="border-line inline-flex rounded-md border p-1">
                    {views.map((v) => (
                        <button
                            key={v.value}
                            type="button"
                            aria-pressed={view === v.value}
                            onClick={() => setView(v.value)}
                            className={cn(
                                'ease-calm min-h-11 rounded px-5 text-sm transition-colors duration-150',
                                view === v.value ? 'bg-primary text-primary-foreground' : 'text-ink-soft hover:text-ink',
                            )}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                <form id="tambah" onSubmit={submitAdd} noValidate className="grid scroll-mt-24 items-end gap-4 sm:grid-cols-[1fr_12rem_auto]">
                    <TextField
                        label="Tambah tugas"
                        name="title"
                        placeholder="mis. Survei venue kedua"
                        value={add.data.title}
                        error={add.errors.title}
                        onChange={(e) => add.setData('title', e.target.value)}
                    />
                    <TextField
                        label="Tenggat"
                        name="due_date"
                        type="date"
                        value={add.data.due_date}
                        error={add.errors.due_date}
                        onChange={(e) => add.setData('due_date', e.target.value)}
                    />
                    <Button type="submit" className="h-11" disabled={add.processing}>
                        {add.processing ? 'Menyimpan…' : 'Tambah'}
                    </Button>
                </form>

                {tasks.length === 0 && (
                    <EmptyState title="Belum ada tugas">
                        Selesaikan onboarding untuk memuat template, atau tambahkan tugas pertama di atas.
                    </EmptyState>
                )}

                {view === 'roadmap' && tasks.length > 0 && (
                    <div className="space-y-12">
                        <p className="text-ink-faint text-sm">{templateLabel}</p>
                        {phases.map((phase, index) => {
                            const list = byPhase.get(phase.number) ?? [];
                            if (list.length === 0) return null;
                            const done = list.filter((t) => t.status === 'selesai').length;
                            return (
                                <section key={phase.number} aria-labelledby={`fase-${phase.number}`}>
                                    <SectionHeading
                                        id={`fase-${phase.number}`}
                                        number={`Fase ${roman[index]}`}
                                        title={phase.name}
                                        description={`${done} dari ${list.length} tugas selesai`}
                                    />
                                    <ProgressRule value={done} max={list.length} label={`Progres fase ${phase.name}`} className="mb-2" />
                                    <ul className="divide-line divide-y">
                                        {list.map((t) => (
                                            <TaskRow key={t.id} {...rowProps(t)} />
                                        ))}
                                    </ul>
                                </section>
                            );
                        })}
                        {(byPhase.get(null) ?? []).length > 0 && (
                            <section aria-labelledby="fase-lain">
                                <SectionHeading id="fase-lain" title="Tugas tambahan" />
                                <ul className="divide-line divide-y">
                                    {(byPhase.get(null) ?? []).map((t) => (
                                        <TaskRow key={t.id} {...rowProps(t)} />
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                )}

                {view === 'kalender' && (
                    <section aria-labelledby="bulan-ini">
                        <div className="mb-4 flex items-center justify-between">
                            <Button variant="ghost" size="icon" className="size-11" aria-label="Bulan sebelumnya" onClick={() => shift(-1)}>
                                <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />
                            </Button>
                            <h2 id="bulan-ini" className="text-2xl">
                                {tanggal(`${month}-01`, { month: 'long', year: 'numeric' })}
                            </h2>
                            <Button variant="ghost" size="icon" className="size-11" aria-label="Bulan berikutnya" onClick={() => shift(1)}>
                                <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
                            </Button>
                        </div>

                        <div className="border-line hidden grid-cols-7 border-t border-l md:grid" aria-hidden="true">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                                <div key={d} className="border-line text-ink-faint border-r border-b px-2 py-1 text-xs uppercase">
                                    {d}
                                </div>
                            ))}
                            {Array.from({ length: firstWeekday }).map((_, i) => (
                                <div key={`b${i}`} className="border-line bg-sunk/40 min-h-24 border-r border-b" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const iso = `${month}-${String(i + 1).padStart(2, '0')}`;
                                const dayTasks = monthTasks.filter((t) => t.due_date === iso);
                                return (
                                    <div key={iso} className={cn('border-line min-h-24 border-r border-b p-1.5', iso === today && 'bg-brand-soft')}>
                                        <p className="num text-ink-faint text-xs">{i + 1}</p>
                                        {dayTasks.slice(0, 3).map((t) => (
                                            <p
                                                key={t.id}
                                                className={cn('mt-1 truncate text-xs', t.status === 'selesai' && 'text-ink-faint line-through')}
                                            >
                                                {t.title}
                                            </p>
                                        ))}
                                        {dayTasks.length > 3 && <p className="text-ink-faint mt-1 text-xs">+{dayTasks.length - 3} lagi</p>}
                                    </div>
                                );
                            })}
                        </div>

                        {monthTasks.length === 0 ? (
                            <p className="text-ink-soft mt-4">Tidak ada tugas bertenggat di bulan ini.</p>
                        ) : (
                            <ul className="divide-line mt-6 divide-y">
                                {monthTasks.map((t) => (
                                    <TaskRow key={t.id} {...rowProps(t)} />
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                {view === 'fokus' && (
                    <div className="space-y-12">
                        {(
                            [
                                ['Terlambat', focus.late],
                                ['Perlu dijadwal ulang', focus.resched],
                                ['7 hari ke depan', focus.week],
                                ['Sisa bulan ini', focus.month],
                            ] as [string, TaskItem[]][]
                        ).map(([title, list]) =>
                            list.length === 0 ? null : (
                                <section key={title} aria-label={title}>
                                    <SectionHeading title={title} description={`${list.length} tugas`} />
                                    <ul className="divide-line divide-y">
                                        {list.map((t) => (
                                            <TaskRow key={t.id} {...rowProps(t)} />
                                        ))}
                                    </ul>
                                </section>
                            ),
                        )}
                        {focus.late.length + focus.resched.length + focus.week.length + focus.month.length === 0 && (
                            <EmptyState title="Tidak ada yang mendesak">
                                Semua tugas bertenggat sudah selesai, atau belum ada tugas untuk bulan ini.
                            </EmptyState>
                        )}
                    </div>
                )}
            </div>

            <TaskDialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} task={editing} members={members} slots={slots} />
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title={`Hapus "${deleting?.title ?? ''}"?`}
                description={
                    deleting?.from_template ? 'Tugas ini berasal dari template; menjalankan template lagi akan membuatnya kembali.' : undefined
                }
                confirmLabel="Hapus"
                destructive
                busy={busy}
                onConfirm={() => {
                    if (!deleting) return;
                    setBusy(true);
                    router.delete(`/timeline/tugas/${deleting.id}`, {
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
