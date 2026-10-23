import { MoneyField, SelectField, TextAreaField, TextField } from '@/components/planner/field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type CandidateData, type CriterionData } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slotId: number;
    candidate: CandidateData | null;
    criteria: CriterionData[];
}

type Status = Exclude<CandidateData['status'], 'terpilih'>;

export function CandidateDialog({ open, onOpenChange, slotId, candidate, criteria }: Props) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        name: '',
        status: 'shortlist' as Status,
        city: '',
        phone: '',
        instagram: '',
        website: '',
        package_name: '',
        quoted_price: null as number | null,
        quoted_on: '',
        quote_valid_until: '',
        inclusions: '',
        exclusions: '',
        pros: '',
        cons: '',
        source: '',
        notes: '',
        scores: {} as Record<string, number | ''>,
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        setData({
            name: candidate?.name ?? '',
            status: (candidate && candidate.status !== 'terpilih' ? candidate.status : 'shortlist') as Status,
            city: candidate?.city ?? '',
            phone: candidate?.phone ?? '',
            instagram: candidate?.instagram ?? '',
            website: candidate?.website ?? '',
            package_name: candidate?.package_name ?? '',
            quoted_price: candidate?.quoted_price ?? null,
            quoted_on: candidate?.quoted_on ?? '',
            quote_valid_until: candidate?.quote_valid_until ?? '',
            inclusions: candidate?.inclusions ?? '',
            exclusions: candidate?.exclusions ?? '',
            pros: candidate?.pros ?? '',
            cons: candidate?.cons ?? '',
            source: candidate?.source ?? '',
            notes: candidate?.notes ?? '',
            scores: candidate?.scores ?? {},
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, candidate?.id]);

    const chosen = candidate?.status === 'terpilih';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (candidate) put(`/vendor/kandidat/${candidate.id}`, options);
        else post(`/vendor/slot/${slotId}/kandidat`, options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{candidate ? `Ubah ${candidate.name}` : 'Tambah kandidat'}</DialogTitle>
                    <DialogDescription>Semua data berasal dari input kalian; tidak ada harga atau vendor yang diisi otomatis.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Nama vendor"
                            name="name"
                            required
                            autoFocus
                            value={data.name}
                            error={errors.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {chosen ? (
                            <TextField
                                label="Status"
                                name="status_readonly"
                                value="Terpilih"
                                disabled
                                hint="Pilih kandidat lain untuk mengganti vendor terpilih."
                                readOnly
                            />
                        ) : (
                            <SelectField
                                label="Status"
                                name="status"
                                value={data.status}
                                error={errors.status}
                                onChange={(e) => setData('status', e.target.value as Status)}
                            >
                                <option value="shortlist">Shortlist</option>
                                <option value="dihubungi">Sudah dihubungi</option>
                                <option value="survei">Sudah survei</option>
                                <option value="negosiasi">Negosiasi</option>
                                <option value="ditolak">Ditolak</option>
                            </SelectField>
                        )}
                        <TextField label="Kota" name="city" value={data.city} error={errors.city} onChange={(e) => setData('city', e.target.value)} />
                        <TextField
                            label="Telepon / WhatsApp"
                            name="phone"
                            inputMode="tel"
                            value={data.phone}
                            error={errors.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <TextField
                            label="Instagram"
                            name="instagram"
                            placeholder="@namaakun"
                            value={data.instagram}
                            error={errors.instagram}
                            onChange={(e) => setData('instagram', e.target.value)}
                        />
                        <TextField
                            label="Situs"
                            name="website"
                            type="url"
                            placeholder="https://"
                            value={data.website}
                            error={errors.website}
                            onChange={(e) => setData('website', e.target.value)}
                        />
                    </div>

                    <fieldset className="border-line grid gap-4 border-t pt-4 sm:grid-cols-2">
                        <legend className="text-ink-faint mb-2 text-xs tracking-[0.14em] uppercase">Penawaran</legend>
                        <TextField
                            label="Nama paket"
                            name="package_name"
                            value={data.package_name}
                            error={errors.package_name}
                            onChange={(e) => setData('package_name', e.target.value)}
                        />
                        <MoneyField
                            label="Harga penawaran (total)"
                            value={data.quoted_price}
                            error={errors.quoted_price}
                            onValueChange={(v) => setData('quoted_price', v)}
                        />
                        <TextField
                            label="Tanggal penawaran"
                            name="quoted_on"
                            type="date"
                            value={data.quoted_on}
                            error={errors.quoted_on}
                            onChange={(e) => setData('quoted_on', e.target.value)}
                        />
                        <TextField
                            label="Berlaku sampai"
                            name="quote_valid_until"
                            type="date"
                            value={data.quote_valid_until}
                            error={errors.quote_valid_until}
                            onChange={(e) => setData('quote_valid_until', e.target.value)}
                        />
                        <TextAreaField
                            label="Sudah termasuk"
                            name="inclusions"
                            value={data.inclusions}
                            onChange={(e) => setData('inclusions', e.target.value)}
                        />
                        <TextAreaField
                            label="Belum termasuk"
                            name="exclusions"
                            value={data.exclusions}
                            onChange={(e) => setData('exclusions', e.target.value)}
                        />
                        <TextAreaField label="Kelebihan" name="pros" value={data.pros} onChange={(e) => setData('pros', e.target.value)} />
                        <TextAreaField label="Kekurangan" name="cons" value={data.cons} onChange={(e) => setData('cons', e.target.value)} />
                        <TextField
                            label="Sumber info"
                            name="source"
                            placeholder="Rekomendasi, wedding fair, Instagram…"
                            value={data.source}
                            onChange={(e) => setData('source', e.target.value)}
                        />
                    </fieldset>

                    {criteria.length > 0 && (
                        <fieldset className="border-line grid gap-4 border-t pt-4 sm:grid-cols-2">
                            <legend className="text-ink-faint mb-2 text-xs tracking-[0.14em] uppercase">Skor pribadi (1–5)</legend>
                            {criteria.map((criterion) => (
                                <SelectField
                                    key={criterion.id}
                                    label={criterion.name}
                                    name={`score-${criterion.id}`}
                                    value={data.scores[criterion.id] ?? ''}
                                    onChange={(e) =>
                                        setData('scores', { ...data.scores, [criterion.id]: e.target.value === '' ? '' : Number(e.target.value) })
                                    }
                                >
                                    <option value="">Belum dinilai</option>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </SelectField>
                            ))}
                        </fieldset>
                    )}

                    <TextAreaField label="Catatan" name="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
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
