import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { EmptyState } from '@/components/planner/empty-state';
import { SelectField, TextAreaField, TextField } from '@/components/planner/field';
import { PageHeader } from '@/components/planner/page-header';
import { SimplePagination } from '@/components/planner/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { tanggal } from '@/lib/format';
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Note {
    id: number;
    title: string;
    body: string;
    visibility: 'shared' | 'private';
    reveal_on: string | null;
    mine: boolean;
    author: string;
    scheduled: boolean;
}

interface Props {
    notes: { data: Note[]; prev_page_url: string | null; next_page_url: string | null };
    today: string;
}

function NoteDialog({ open, onOpenChange, note, today }: { open: boolean; onOpenChange: (o: boolean) => void; note: Note | null; today: string }) {
    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        title: '',
        body: '',
        visibility: 'shared',
        reveal_on: '',
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (note) setData({ title: note.title, body: note.body, visibility: note.visibility, reveal_on: note.reveal_on ?? '' });
        else reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, note?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (note) put(`/catatan/${note.id}`, options);
        else post('/catatan', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{note ? 'Ubah catatan' : 'Tulis catatan'}</DialogTitle>
                    <DialogDescription>Catatan terjadwal tidak terlihat oleh pasangan sampai tanggal bukanya tiba.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4" noValidate>
                    <TextField
                        label="Judul"
                        name="title"
                        required
                        autoFocus
                        value={data.title}
                        error={errors.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    <TextAreaField
                        label="Isi pesan"
                        name="body"
                        required
                        rows={5}
                        value={data.body}
                        error={errors.body}
                        onChange={(e) => setData('body', e.target.value)}
                    />
                    <SelectField
                        label="Siapa yang bisa membaca"
                        name="visibility"
                        value={data.visibility}
                        error={errors.visibility}
                        onChange={(e) => setData('visibility', e.target.value)}
                    >
                        <option value="shared">Kita berdua</option>
                        <option value="private">Hanya saya</option>
                    </SelectField>
                    {data.visibility === 'shared' && (
                        <TextField
                            label="Baru terbuka pada (opsional)"
                            name="reveal_on"
                            type="date"
                            min={today}
                            value={data.reveal_on}
                            error={errors.reveal_on}
                            onChange={(e) => setData('reveal_on', e.target.value)}
                        />
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function NotesIndex({ notes, today }: Props) {
    const [editing, setEditing] = useState<Note | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState<Note | null>(null);

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Catatan" />
            <div className="space-y-10">
                <PageHeader
                    eyebrow="Catatan"
                    title="Pesan untuk kita"
                    description="Tulis untuk pasangan, simpan untuk diri sendiri, atau jadwalkan agar terbuka di hari yang dipilih."
                    actions={
                        <Button className="h-11" onClick={openNew}>
                            <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Tulis catatan
                        </Button>
                    }
                />

                {notes.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada catatan"
                        action={
                            <Button variant="outline" onClick={openNew}>
                                Tulis catatan pertama
                            </Button>
                        }
                    >
                        Satu kalimat hangat sudah cukup.
                    </EmptyState>
                ) : (
                    <ul className="divide-line divide-y">
                        {notes.data.map((n) => (
                            <li key={n.id} className="py-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-2xl font-medium">{n.title}</h2>
                                        <p className="text-ink-faint mt-1 flex flex-wrap items-center gap-x-3 text-sm">
                                            <span>{n.mine ? 'Dari saya' : `Dari ${n.author}`}</span>
                                            {n.visibility === 'private' && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Lock className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Hanya saya
                                                </span>
                                            )}
                                            {n.scheduled && n.reveal_on && (
                                                <span className="text-amber inline-flex items-center gap-1">
                                                    <Clock className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Terbuka untuk pasangan{' '}
                                                    {tanggal(n.reveal_on)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {n.mine && (
                                        <div className="flex">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-11"
                                                aria-label={`Ubah ${n.title}`}
                                                onClick={() => {
                                                    setEditing(n);
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-11"
                                                aria-label={`Hapus ${n.title}`}
                                                onClick={() => setDeleting(n)}
                                            >
                                                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-ink-soft mt-3 max-w-prose whitespace-pre-line">{n.body}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <SimplePagination prev={notes.prev_page_url} next={notes.next_page_url} />
            </div>

            <NoteDialog open={dialogOpen} onOpenChange={setDialogOpen} note={editing} today={today} />
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title="Hapus catatan ini?"
                description={`“${deleting?.title ?? ''}” akan dihapus permanen.`}
                confirmLabel="Hapus"
                destructive
                onConfirm={() => deleting && router.delete(`/catatan/${deleting.id}`, { preserveScroll: true, onSuccess: () => setDeleting(null) })}
            />
        </AppLayout>
    );
}
