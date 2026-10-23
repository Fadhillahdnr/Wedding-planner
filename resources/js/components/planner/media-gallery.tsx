import { Button } from '@/components/ui/button';
import { type MediaItem } from '@/types';
import { router } from '@inertiajs/react';
import { FileText, LoaderCircle, Paperclip, Trash2 } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

interface Props {
    target: 'vendor_meeting' | 'vendor_candidate';
    targetId: number;
    items: MediaItem[];
    accept: string;
    label: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

function xsrf(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function api<T>(url: string, body?: unknown): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? 'Terjadi kesalahan. Coba lagi.');

    return json as T;
}

/** Unggah langsung ke Cloudinary dengan tanda tangan dari server; server memverifikasi ulang sebelum berkas tampil. */
export function MediaGallery({ target, targetId, items, accept, label }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setError('Ukuran berkas maksimal 10 MB.');
            return;
        }

        setBusy(true);
        setError(null);
        try {
            const { asset_id, upload } = await api<{ asset_id: number; upload: { url: string; fields: Record<string, string> } }>(
                '/media/tanda-tangan',
                { target, target_id: targetId },
            );

            const form = new FormData();
            Object.entries(upload.fields).forEach(([k, v]) => form.append(k, String(v)));
            form.append('file', file);
            const res = await fetch(upload.url, { method: 'POST', body: form });
            if (!res.ok) throw new Error('Unggah ke penyimpanan gagal. Periksa format dan ukuran berkas.');

            await api(`/media/${asset_id}/konfirmasi`);
            router.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unggah gagal.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-2">
            {items.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {items.map((m) => (
                        <li key={m.id} className="border-line relative size-20 overflow-hidden rounded-md border">
                            <a href={`/media/${m.id}`} target="_blank" rel="noreferrer" className="flex size-full items-center justify-center">
                                {m.kind === 'photo' ? (
                                    <img src={`/media/${m.id}`} alt="Foto terlampir" loading="lazy" className="size-full object-cover" />
                                ) : (
                                    <span className="text-ink-soft flex flex-col items-center gap-1 text-xs">
                                        <FileText className="size-6" strokeWidth={1.5} aria-hidden="true" /> PDF
                                    </span>
                                )}
                                <span className="sr-only">Buka {m.kind === 'photo' ? 'foto' : 'dokumen'}</span>
                            </a>
                            <button
                                type="button"
                                aria-label="Hapus berkas"
                                className="bg-paper/90 absolute top-0 right-0 flex size-8 items-center justify-center rounded-bl-md"
                                onClick={() => router.delete(`/media/${m.id}`, { preserveScroll: true })}
                            >
                                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <input ref={input} type="file" accept={accept} className="sr-only" tabIndex={-1} onChange={onPick} aria-label={label} />
            <Button type="button" variant="outline" size="sm" className="h-11" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                    <Paperclip className="size-4" strokeWidth={1.5} aria-hidden="true" />
                )}
                {busy ? 'Mengunggah…' : label}
            </Button>
            {error && (
                <p role="alert" className="text-danger text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
