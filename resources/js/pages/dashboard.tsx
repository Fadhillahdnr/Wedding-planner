import { Field } from '@/components/site/field';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dateId, idr } from '@/lib/format';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface EventT {
    id: number;
    title: string;
    partner_name: string | null;
    event_date: string | null;
    venue: string | null;
    guest_estimate: number | null;
    budget_total: string;
}
interface TaskT {
    id: number;
    title: string;
    due_date: string | null;
    is_done: boolean;
}
interface BudgetItemT {
    id: number;
    category: string;
    name: string;
    estimated: string;
    actual: string;
}
interface Summary {
    total: string;
    estimated: string;
    actual: string;
    remaining: string;
    over_budget: boolean;
}

const crumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({
    event,
    tasks,
    budgetItems,
    budget,
    bookingCount,
}: {
    event: EventT | null;
    tasks: TaskT[];
    budgetItems: BudgetItemT[];
    budget: Summary | null;
    bookingCount: number;
}) {
    const { auth } = usePage<SharedData>().props;
    const done = tasks.filter((t) => t.is_done).length;

    return (
        <AppLayout breadcrumbs={crumbs}>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-5xl space-y-10 p-5 lg:p-8">
                <header>
                    <h1 className="font-display text-4xl">Halo, {auth.user?.name}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {event ? `${event.title} · ${dateId(event.event_date)}` : 'Mulai dengan mengisi detail acara Anda.'} · {bookingCount} booking
                    </p>
                </header>
                <EventForm event={event} />
                {event ? (
                    <>
                        <Tasks tasks={tasks} done={done} />
                        <Budget items={budgetItems} summary={budget!} />
                    </>
                ) : (
                    <p className="text-muted-foreground border border-dashed p-10 text-center text-sm">
                        Checklist dan anggaran akan muncul setelah detail acara disimpan.
                    </p>
                )}
            </div>
        </AppLayout>
    );
}

function EventForm({ event }: { event: EventT | null }) {
    const { data, setData, put, processing, errors } = useForm({
        title: event?.title ?? '',
        partner_name: event?.partner_name ?? '',
        event_date: event?.event_date?.slice(0, 10) ?? '',
        venue: event?.venue ?? '',
        guest_estimate: event?.guest_estimate?.toString() ?? '',
        budget_total: event?.budget_total ?? '0',
    });
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/dashboard/event', { preserveScroll: true });
    };
    const b = (k: keyof typeof data) => ({
        name: k,
        value: data[k],
        error: errors[k],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setData(k, e.target.value),
    });

    return (
        <section aria-labelledby="acara" className="bg-card border p-6">
            <h2 id="acara" className="font-display text-2xl">
                Detail acara
            </h2>
            <form onSubmit={submit} className="mt-5 grid gap-5 sm:grid-cols-2" noValidate>
                <Field label="Nama acara" required {...b('title')} />
                <Field label="Nama pasangan" {...b('partner_name')} />
                <Field label="Tanggal" type="date" {...b('event_date')} />
                <Field label="Lokasi" {...b('venue')} />
                <Field label="Estimasi tamu" type="number" min={1} {...b('guest_estimate')} />
                <Field label="Total anggaran (Rp)" type="number" min={0} required {...b('budget_total')} />
                <div className="sm:col-span-2">
                    <Button type="submit" disabled={processing}>
                        Simpan
                    </Button>
                </div>
            </form>
        </section>
    );
}

function Tasks({ tasks, done }: { tasks: TaskT[]; done: number }) {
    const { data, setData, post, processing, reset, errors } = useForm({ title: '', due_date: '' });
    const add: FormEventHandler = (e) => {
        e.preventDefault();
        post('/dashboard/tasks', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <section aria-labelledby="tugas" className="bg-card border p-6">
            <h2 id="tugas" className="font-display text-2xl">
                Checklist{' '}
                <span className="text-muted-foreground text-base">
                    ({done}/{tasks.length})
                </span>
            </h2>
            <form onSubmit={add} className="mt-5 flex flex-wrap items-end gap-3">
                <div className="min-w-48 flex-1">
                    <Field
                        label="Tugas baru"
                        name="title"
                        value={data.title}
                        error={errors.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                </div>
                <Field label="Tenggat" name="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                <Button type="submit" disabled={processing}>
                    Tambah
                </Button>
            </form>
            {tasks.length === 0 ? (
                <p className="text-muted-foreground mt-6 text-sm">Belum ada tugas.</p>
            ) : (
                <ul className="mt-6 divide-y">
                    {tasks.map((t) => (
                        <li key={t.id} className="flex items-center gap-3 py-3">
                            <input
                                id={`t${t.id}`}
                                type="checkbox"
                                checked={t.is_done}
                                onChange={() => router.patch(`/dashboard/tasks/${t.id}`, {}, { preserveScroll: true })}
                                className="size-5 accent-[var(--sage)]"
                            />
                            <label htmlFor={`t${t.id}`} className={`flex-1 text-sm ${t.is_done ? 'text-muted-foreground line-through' : ''}`}>
                                {t.title}
                                {t.due_date && <span className="text-muted-foreground"> · {dateId(t.due_date)}</span>}
                            </label>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Hapus tugas ${t.title}`}
                                onClick={() => router.delete(`/dashboard/tasks/${t.id}`, { preserveScroll: true })}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function Budget({ items, summary }: { items: BudgetItemT[]; summary: Summary }) {
    const { data, setData, post, processing, reset, errors } = useForm({ category: '', name: '', estimated: '', actual: '' });
    const add: FormEventHandler = (e) => {
        e.preventDefault();
        post('/dashboard/budget', { preserveScroll: true, onSuccess: () => reset() });
    };
    const stat = (l: string, v: string, bad = false) => (
        <div>
            <dt className="text-muted-foreground text-xs tracking-widest uppercase">{l}</dt>
            <dd className={`font-display text-2xl ${bad ? 'text-destructive' : ''}`}>{idr(v)}</dd>
        </div>
    );

    return (
        <section aria-labelledby="anggaran" className="bg-card border p-6">
            <h2 id="anggaran" className="font-display text-2xl">
                Anggaran
            </h2>
            <dl className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
                {stat('Total', summary.total)}
                {stat('Estimasi', summary.estimated)}
                {stat('Realisasi', summary.actual)}
                {stat(summary.over_budget ? 'Melebihi anggaran' : 'Sisa', summary.remaining, summary.over_budget)}
            </dl>
            <form onSubmit={add} className="mt-6 grid gap-3 sm:grid-cols-5 sm:items-end">
                <Field
                    label="Kategori"
                    name="category"
                    required
                    value={data.category}
                    error={errors.category}
                    onChange={(e) => setData('category', e.target.value)}
                />
                <Field label="Item" name="name" required value={data.name} error={errors.name} onChange={(e) => setData('name', e.target.value)} />
                <Field
                    label="Estimasi"
                    name="estimated"
                    type="number"
                    min={0}
                    required
                    value={data.estimated}
                    error={errors.estimated}
                    onChange={(e) => setData('estimated', e.target.value)}
                />
                <Field
                    label="Realisasi"
                    name="actual"
                    type="number"
                    min={0}
                    value={data.actual}
                    onChange={(e) => setData('actual', e.target.value)}
                />
                <Button type="submit" disabled={processing}>
                    Tambah
                </Button>
            </form>
            {items.length === 0 ? (
                <p className="text-muted-foreground mt-6 text-sm">Belum ada item anggaran.</p>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <caption className="sr-only">Rincian anggaran</caption>
                        <thead className="text-muted-foreground text-xs uppercase">
                            <tr>
                                <th scope="col" className="py-2">
                                    Kategori
                                </th>
                                <th scope="col">Item</th>
                                <th scope="col" className="text-right">
                                    Estimasi
                                </th>
                                <th scope="col" className="text-right">
                                    Realisasi
                                </th>
                                <th scope="col">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((i) => (
                                <tr key={i.id}>
                                    <td className="py-3">{i.category}</td>
                                    <td>{i.name}</td>
                                    <td className="text-right">{idr(i.estimated)}</td>
                                    <td className="text-right">{idr(i.actual)}</td>
                                    <td className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Hapus ${i.name}`}
                                            onClick={() => router.delete(`/dashboard/budget/${i.id}`, { preserveScroll: true })}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
