const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

/** Uang selalu integer rupiah: "Rp 12.500.000". Null tampil sebagai tanda strip, bukan nol yang menyesatkan. */
export function rupiah(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : idr.format(value).replace(/\u00a0/g, ' ');
}

/** Tampilan ringkas untuk angka hero: "Rp 125 jt". */
export function rupiahShort(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
    return rupiah(value);
}

export function tanggal(
    iso: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
    if (!iso) return '—';
    // Tanggal tanpa jam diparse sebagai tengah hari lokal agar tidak bergeser zona waktu.
    return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('id-ID', options);
}

export function bulan(ym: string | null | undefined): string {
    return ym ? tanggal(`${ym}-01`, { month: 'long', year: 'numeric' }) : '—';
}

/** "3 bulan lagi", "5 hari lagi", "kemarin" — untuk tenggat. */
export function relatif(iso: string | null | undefined, today: string): string {
    if (!iso) return 'tanpa tenggat';
    const diff = Math.round((new Date(`${iso.slice(0, 10)}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
    if (diff === 0) return 'hari ini';
    if (diff === 1) return 'besok';
    if (diff === -1) return 'kemarin';
    return diff > 0 ? `${diff} hari lagi` : `terlambat ${-diff} hari`;
}

export function parseRupiah(input: string): number | null {
    const digits = input.replace(/[^\d]/g, '');
    return digits === '' ? null : Number(digits);
}
