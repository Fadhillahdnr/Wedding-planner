import { TextAreaField, TextField } from '@/components/planner/field';
import { MediaGallery } from '@/components/planner/media-gallery';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { tanggal } from '@/lib/format';
import { type CandidateData } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { ListPlus, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: CandidateData | null;
    slotId: number;
    today: string;
}

export function MeetingDialog({ open, onOpenChange, candidate, slotId, today }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ met_on: today, notes: '', follow_up: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!candidate) return;
        post(`/vendor/kandidat/${candidate.id}/pertemuan`, { preserveScroll: true, onSuccess: () => reset('notes', 'follow_up') });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Catatan pertemuan — {candidate?.name}</DialogTitle>
                    <DialogDescription>Catat hasil survei atau meeting, lalu jadikan tindak lanjut sebagai tugas.</DialogDescription>
                </DialogHeader>

                {candidate && (
                    <section aria-label="Dokumen penawaran" className="space-y-2">
                        <h3 className="text-sm font-medium">Dokumen penawaran</h3>
                        <MediaGallery target="vendor_candidate" targetId={candidate.id} items={candidate.media} pdf label="Tambah dokumen / foto" />
                    </section>
                )}

                {candidate && candidate.meetings.length > 0 && (
                    <ul className="divide-line divide-y border-y">
                        {candidate.meetings.map((m) => (
                            <li key={m.id} className="space-y-1 py-3 text-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="num font-medium">{tanggal(m.met_on)}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="-my-2 size-11"
                                        aria-label={`Hapus catatan ${tanggal(m.met_on)}`}
                                        onClick={() => router.delete(`/vendor/pertemuan/${m.id}`, { preserveScroll: true })}
                                    >
                                        <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                                    </Button>
                                </div>
                                {m.notes && <p className="text-ink-soft whitespace-pre-line">{m.notes}</p>}
                                <MediaGallery target="vendor_meeting" targetId={m.id} items={m.media} label="Tambah foto" />
                                {m.follow_up && (
                                    <p className="flex flex-wrap items-center gap-2">
                                        <span>
                                            <span className="text-ink-faint">Tindak lanjut:</span> {m.follow_up}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9"
                                            onClick={() =>
                                                router.post(
                                                    '/timeline/tugas',
                                                    { title: m.follow_up, vendor_slot_id: slotId },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <ListPlus className="size-4" strokeWidth={1.5} aria-hidden="true" /> Jadikan tugas
                                        </Button>
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={submit} className="grid gap-4" noValidate>
                    <TextField
                        label="Tanggal"
                        name="met_on"
                        type="date"
                        required
                        value={data.met_on}
                        error={errors.met_on}
                        onChange={(e) => setData('met_on', e.target.value)}
                    />
                    <TextAreaField
                        label="Catatan"
                        name="notes"
                        value={data.notes}
                        error={errors.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <TextField
                        label="Tindak lanjut"
                        name="follow_up"
                        placeholder="mis. Minta rincian paket tanpa dekorasi"
                        value={data.follow_up}
                        error={errors.follow_up}
                        onChange={(e) => setData('follow_up', e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan…' : 'Simpan catatan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
