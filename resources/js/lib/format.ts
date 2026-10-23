export const idr = (v: string | number | null | undefined): string =>
    v === null || v === undefined || v === ''
        ? '—'
        : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v));

export const dateId = (v: string | null | undefined): string =>
    v ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(v)) : '—';
