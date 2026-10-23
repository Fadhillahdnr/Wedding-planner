import { MoneyField, SelectField, TextAreaField, TextField } from '@/components/planner/field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type BudgetCategoryData, type FundingData, type PaymentData } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect } from 'react';

function DialogFrame({
    open,
    onOpenChange,
    title,
    children,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    title: string;
    children: ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}

function Actions({ processing, onCancel }: { processing: boolean; onCancel: () => void }) {
    return (
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
                Batal
            </Button>
            <Button type="submit" disabled={processing}>
                {processing ? 'Menyimpan…' : 'Simpan'}
            </Button>
        </div>
    );
}

interface DialogProps<T> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: T | null;
}

export function CategoryDialog({ open, onOpenChange, record }: DialogProps<BudgetCategoryData>) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm({ name: '', allocated_amount: null as number | null });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        setData({ name: record?.name ?? '', allocated_amount: record?.allocated_amount ?? null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, record?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (record) put(`/anggaran/kategori/${record.id}`, options);
        else post('/anggaran/kategori', options);
    };

    return (
        <DialogFrame open={open} onOpenChange={onOpenChange} title={record ? 'Ubah kategori' : 'Tambah kategori'}>
            <form onSubmit={submit} className="grid gap-4" noValidate>
                <TextField
                    label="Nama kategori"
                    name="name"
                    required
                    autoFocus
                    value={data.name}
                    error={errors.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <MoneyField
                    label="Alokasi"
                    value={data.allocated_amount}
                    error={errors.allocated_amount}
                    hint="Batas rencana untuk kategori ini; tidak memengaruhi proyeksi."
                    onValueChange={(v) => setData('allocated_amount', v)}
                />
                <Actions processing={processing} onCancel={() => onOpenChange(false)} />
            </form>
        </DialogFrame>
    );
}

export function FundingDialog({ open, onOpenChange, record }: DialogProps<FundingData>) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        name: '',
        collected_amount: 0 as number | null,
        target_amount: null as number | null,
        monthly_contribution: 0 as number | null,
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        setData({
            name: record?.name ?? '',
            collected_amount: record?.collected_amount ?? 0,
            target_amount: record?.target_amount ?? null,
            monthly_contribution: record?.monthly_contribution ?? 0,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, record?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (record) put(`/anggaran/dana/${record.id}`, options);
        else post('/anggaran/dana', options);
    };

    return (
        <DialogFrame open={open} onOpenChange={onOpenChange} title={record ? 'Ubah sumber dana' : 'Tambah sumber dana'}>
            <form onSubmit={submit} className="grid gap-4" noValidate>
                <TextField
                    label="Nama sumber"
                    name="name"
                    required
                    autoFocus
                    placeholder="mis. Tabungan pribadi, bantuan orang tua"
                    value={data.name}
                    error={errors.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <MoneyField
                    label="Sudah terkumpul"
                    value={data.collected_amount}
                    error={errors.collected_amount}
                    onValueChange={(v) => setData('collected_amount', v ?? 0)}
                />
                <MoneyField
                    label="Target (opsional)"
                    value={data.target_amount}
                    error={errors.target_amount}
                    onValueChange={(v) => setData('target_amount', v)}
                />
                <MoneyField
                    label="Setoran per bulan"
                    value={data.monthly_contribution}
                    error={errors.monthly_contribution}
                    onValueChange={(v) => setData('monthly_contribution', v ?? 0)}
                />
                <Actions processing={processing} onCancel={() => onOpenChange(false)} />
            </form>
        </DialogFrame>
    );
}

interface PaymentDialogProps extends DialogProps<PaymentData> {
    items: { id: number; name: string }[];
}

export function PaymentDialog({ open, onOpenChange, record, items }: PaymentDialogProps) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        budget_item_id: '' as number | '',
        label: '',
        amount: null as number | null,
        due_date: '',
        status: 'direncanakan' as PaymentData['status'],
        paid_on: '',
        method: '',
        notes: '',
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        setData({
            budget_item_id: record?.budget_item_id ?? '',
            label: record?.label ?? '',
            amount: record?.amount ?? null,
            due_date: record?.due_date ?? '',
            status: record?.status ?? 'direncanakan',
            paid_on: record?.paid_on ?? '',
            method: record?.method ?? '',
            notes: record?.notes ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, record?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (record) put(`/anggaran/pembayaran/${record.id}`, options);
        else post('/anggaran/pembayaran', options);
    };

    return (
        <DialogFrame open={open} onOpenChange={onOpenChange} title={record ? 'Ubah pembayaran' : 'Catat pembayaran'}>
            <form onSubmit={submit} className="grid gap-4" noValidate>
                <SelectField
                    label="Untuk item"
                    name="budget_item_id"
                    required
                    value={data.budget_item_id}
                    error={errors.budget_item_id}
                    onChange={(e) => setData('budget_item_id', e.target.value === '' ? '' : Number(e.target.value))}
                >
                    <option value="">Pilih item</option>
                    {items.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </SelectField>
                <TextField
                    label="Keterangan"
                    name="label"
                    required
                    placeholder="DP, termin 2, pelunasan…"
                    value={data.label}
                    error={errors.label}
                    onChange={(e) => setData('label', e.target.value)}
                />
                <MoneyField label="Jumlah" required value={data.amount} error={errors.amount} onValueChange={(v) => setData('amount', v)} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Status"
                        name="status"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value as PaymentData['status'])}
                    >
                        <option value="direncanakan">Direncanakan</option>
                        <option value="jatuh_tempo">Jatuh tempo</option>
                        <option value="lunas">Lunas</option>
                        <option value="dibatalkan">Dibatalkan</option>
                    </SelectField>
                    <TextField
                        label="Jatuh tempo"
                        name="due_date"
                        type="date"
                        value={data.due_date}
                        error={errors.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                    />
                </div>
                {data.status === 'lunas' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Dibayar pada"
                            name="paid_on"
                            type="date"
                            required
                            value={data.paid_on}
                            error={errors.paid_on}
                            onChange={(e) => setData('paid_on', e.target.value)}
                        />
                        <TextField
                            label="Metode"
                            name="method"
                            placeholder="Transfer, tunai…"
                            value={data.method}
                            onChange={(e) => setData('method', e.target.value)}
                        />
                    </div>
                )}
                <TextAreaField
                    label="Catatan"
                    name="notes"
                    value={data.notes}
                    error={errors.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                />
                <Actions processing={processing} onCancel={() => onOpenChange(false)} />
            </form>
        </DialogFrame>
    );
}
