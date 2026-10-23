import { MoneyField, SelectField, TextAreaField, TextField } from '@/components/planner/field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type BudgetItemData } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryId: number;
    item: BudgetItemData | null;
    guests: number | null;
}

export function ItemDialog({ open, onOpenChange, categoryId, item, guests }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        budget_category_id: categoryId,
        name: '',
        pricing_mode: 'fixed' as 'fixed' | 'per_guest',
        estimate_min: null as number | null,
        estimate_max: null as number | null,
        price_per_guest: null as number | null,
        agreed_amount: null as number | null,
        notes: '',
    });

    // Form diisi ulang tiap dialog dibuka, supaya data item sebelumnya tidak terbawa.
    useEffect(() => {
        if (!open) return;
        clearErrors();
        setData({
            budget_category_id: categoryId,
            name: item?.name ?? '',
            pricing_mode: item?.pricing_mode ?? 'fixed',
            estimate_min: item?.estimate_min ?? null,
            estimate_max: item?.estimate_max ?? null,
            price_per_guest: item?.price_per_guest ?? null,
            agreed_amount: item?.agreed_amount ?? null,
            notes: item?.notes ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item?.id, categoryId]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        };
        if (item) put(`/anggaran/item/${item.id}`, options);
        else post('/anggaran/item', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? 'Ubah item' : 'Tambah item'}</DialogTitle>
                    <DialogDescription>Estimasi adalah rencana; kesepakatan baru diisi setelah harga disetujui vendor.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4" noValidate>
                    <TextField
                        label="Nama item"
                        name="name"
                        required
                        autoFocus
                        value={data.name}
                        error={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <SelectField
                        label="Cara menghitung"
                        name="pricing_mode"
                        value={data.pricing_mode}
                        onChange={(e) => setData('pricing_mode', e.target.value as 'fixed' | 'per_guest')}
                    >
                        <option value="fixed">Harga tetap</option>
                        <option value="per_guest">Per tamu</option>
                    </SelectField>
                    {data.pricing_mode === 'per_guest' ? (
                        <MoneyField
                            label="Harga per tamu"
                            value={data.price_per_guest}
                            error={errors.price_per_guest}
                            hint={guests ? `Dikalikan perkiraan ${guests} tamu.` : 'Isi perkiraan jumlah tamu di Pengaturan agar total terhitung.'}
                            onValueChange={(v) => setData('price_per_guest', v)}
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <MoneyField
                                label="Estimasi terendah"
                                value={data.estimate_min}
                                error={errors.estimate_min}
                                onValueChange={(v) => setData('estimate_min', v)}
                            />
                            <MoneyField
                                label="Estimasi tertinggi"
                                value={data.estimate_max}
                                error={errors.estimate_max}
                                hint="Kosongkan bila hanya satu angka."
                                onValueChange={(v) => setData('estimate_max', v)}
                            />
                        </div>
                    )}
                    <MoneyField
                        label="Kesepakatan dengan vendor"
                        value={data.agreed_amount}
                        error={errors.agreed_amount}
                        hint="Bila diisi, angka ini menggantikan estimasi dalam proyeksi."
                        onValueChange={(v) => setData('agreed_amount', v)}
                    />
                    <TextAreaField
                        label="Catatan"
                        name="notes"
                        value={data.notes}
                        error={errors.notes}
                        onChange={(e) => setData('notes', e.target.value)}
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
