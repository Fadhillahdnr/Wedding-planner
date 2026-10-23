import { ConfirmDialog } from '@/components/planner/confirm-dialog';
import { EmptyState } from '@/components/planner/empty-state';
import { TextAreaField, TextField } from '@/components/planner/field';
import { MediaGallery } from '@/components/planner/media-gallery';
import { PageHeader } from '@/components/planner/page-header';
import { SimplePagination } from '@/components/planner/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { tanggal } from '@/lib/format';
import { type MediaItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Memory {
    id: number;
    title: string;
    caption: string | null;
    happened_on: string | null;
    media: MediaItem[];
}

interface Props {
    memories: { data: Memory[]; prev_page_url: string | null; next_page_url: string | null };
}

function MemoryDialog({ open, onOpenChange, memory }: { open: boolean; onOpenChange: (o: boolean) => void; memory: Memory | null }) {
    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({ title: '', caption: '', happened_on: '' });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (memory) setData({ title: memory.title, caption: memory.caption ?? '', happened_on: memory.happened_on ?? '' });
        else reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, memory?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (memory) put(`/kenangan/${memory.id}`, options);
        else post('/kenangan', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{memory ? 'Ubah kenangan' : 'Simpan kenangan'}</DialogTitle>
                    <DialogDescription>Foto dan video bisa ditambahkan dari kartu kenangan setelah disimpan.</DialogDescription>
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
                    <TextField
                        label="Tanggal kejadian"
                        name="happened_on"
                        type="date"
                        value={data.happened_on}
                        error={errors.happened_on}
                        onChange={(e) => setData('happened_on', e.target.value)}
                    />
                    <TextAreaField
                        label="Cerita singkat"
                        name="caption"
                        value={data.caption}
                        error={errors.caption}
                        onChange={(e) => setData('caption', e.target.value)}
                    />
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

export default function MemoriesIndex({ memories }: Props) {
    const [editing, setEditing] = useState<Memory | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState<Memory | null>(null);

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Kenangan" />
            <div className="space-y-10">
                <PageHeader
                    eyebrow="Kenangan"
                    title="Cerita yang ingin kita simpan"
                    description="Momen kecil beserta foto dan videonya, hanya terlihat oleh kalian berdua."
                    actions={
                        <Button className="h-11" onClick={openNew}>
                            <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Tambah kenangan
                        </Button>
                    }
                />

                {memories.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada kenangan"
                        action={
                            <Button variant="outline" onClick={openNew}>
                                Simpan kenangan pertama
                            </Button>
                        }
                    >
                        Mulai dari momen pertama kalian bertemu, lamaran, atau hari ini.
                    </EmptyState>
                ) : (
                    <ul className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                        {memories.data.map((m) => (
                            <li key={m.id} className="border-line border-t pt-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-2xl font-medium">{m.title}</h2>
                                        {m.happened_on && <p className="text-ink-faint text-sm">{tanggal(m.happened_on)}</p>}
                                    </div>
                                    <div className="flex">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11"
                                            aria-label={`Ubah ${m.title}`}
                                            onClick={() => {
                                                setEditing(m);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11"
                                            aria-label={`Hapus ${m.title}`}
                                            onClick={() => setDeleting(m)}
                                        >
                                            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                        </Button>
                                    </div>
                                </div>
                                {m.caption && <p className="text-ink-soft mt-2 max-w-prose whitespace-pre-line">{m.caption}</p>}
                                <div className="mt-4">
                                    <MediaGallery target="memory" targetId={m.id} items={m.media} video label="Tambah foto atau video" />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <SimplePagination prev={memories.prev_page_url} next={memories.next_page_url} />
            </div>

            <MemoryDialog open={dialogOpen} onOpenChange={setDialogOpen} memory={editing} />
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(o) => !o && setDeleting(null)}
                title="Hapus kenangan ini?"
                description={`“${deleting?.title ?? ''}” beserta foto dan videonya akan dihapus permanen.`}
                confirmLabel="Hapus"
                destructive
                onConfirm={() => deleting && router.delete(`/kenangan/${deleting.id}`, { preserveScroll: true, onSuccess: () => setDeleting(null) })}
            />
        </AppLayout>
    );
}
