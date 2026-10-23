import { SelectField, TextAreaField, TextField } from '@/components/planner/field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type TaskItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskItem | null;
    members: { id: number; name: string }[];
    slots: { id: number; name: string }[];
}

export function TaskDialog({ open, onOpenChange, task, members, slots }: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        title: '',
        description: '',
        due_date: '',
        status: 'belum' as TaskItem['status'],
        priority: 'normal' as TaskItem['priority'],
        assignee_id: '' as number | '',
        vendor_slot_id: '' as number | '',
        date_locked: false as boolean,
    });

    useEffect(() => {
        if (!open || !task) return;
        clearErrors();
        setData({
            title: task.title,
            description: task.description ?? '',
            due_date: task.due_date ?? '',
            status: task.status,
            priority: task.priority,
            assignee_id: task.assignee_id ?? '',
            vendor_slot_id: task.vendor_slot_id ?? '',
            date_locked: task.date_locked,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, task?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!task) return;
        put(`/timeline/tugas/${task.id}`, { preserveScroll: true, onSuccess: () => onOpenChange(false) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Ubah tugas</DialogTitle>
                    <DialogDescription>
                        {task?.from_template ? 'Tugas dari template umum. ' : ''}Mengubah tenggat secara manual mengunci tanggalnya, jadi tidak ikut
                        bergeser saat hari H berubah.
                    </DialogDescription>
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Tenggat"
                            name="due_date"
                            type="date"
                            value={data.due_date}
                            error={errors.due_date}
                            onChange={(e) => setData('due_date', e.target.value)}
                        />
                        <SelectField
                            label="Status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as TaskItem['status'])}
                        >
                            <option value="belum">Belum</option>
                            <option value="dikerjakan">Dikerjakan</option>
                            <option value="selesai">Selesai</option>
                            <option value="dilewati">Dilewati</option>
                        </SelectField>
                        <SelectField
                            label="Prioritas"
                            name="priority"
                            value={data.priority}
                            onChange={(e) => setData('priority', e.target.value as TaskItem['priority'])}
                        >
                            <option value="rendah">Rendah</option>
                            <option value="normal">Normal</option>
                            <option value="tinggi">Tinggi</option>
                        </SelectField>
                        <SelectField
                            label="Penanggung jawab"
                            name="assignee_id"
                            value={data.assignee_id}
                            onChange={(e) => setData('assignee_id', e.target.value === '' ? '' : Number(e.target.value))}
                        >
                            <option value="">Belum ditentukan</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                    <SelectField
                        label="Terkait slot vendor"
                        name="vendor_slot_id"
                        value={data.vendor_slot_id}
                        onChange={(e) => setData('vendor_slot_id', e.target.value === '' ? '' : Number(e.target.value))}
                    >
                        <option value="">Tidak terkait</option>
                        {slots.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </SelectField>
                    <TextAreaField
                        label="Catatan"
                        name="description"
                        value={data.description}
                        error={errors.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <label className="flex min-h-11 items-center gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={data.date_locked}
                            onChange={(e) => setData('date_locked', e.target.checked)}
                            className="accent-brand size-5"
                        />
                        Kunci tenggat (jangan ikut bergeser saat hari H berubah)
                    </label>
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
