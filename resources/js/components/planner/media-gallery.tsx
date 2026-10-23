import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ACCEPT_IMAGE, ACCEPT_PDF, ACCEPT_VIDEO, CompressError, formatBytes, kindOf, prepareMedia } from '@/lib/compress-media';
import { type MediaItem, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { FileText, LoaderCircle, Paperclip, Play, Trash2 } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

interface Props {
    target: 'vendor_meeting' | 'vendor_candidate' | 'memory';
    targetId: number;
    items: MediaItem[];
    label: string;
    /** Izinkan video (hanya untuk target yang didukung server). */
    video?: boolean;
    /** Izinkan dokumen PDF. */
    pdf?: boolean;
}

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

/** Unggah ke Cloudinary lewat XHR agar progres terlihat (berkas video bisa puluhan MB). */
function upload(url: string, form: FormData, onProgress: (fraction: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
        xhr.onload = () => {
            if (xhr.status < 300) return resolve();
            let detail = '';
            try {
                detail = JSON.parse(xhr.responseText)?.error?.message ?? '';
            } catch {
                /* respons bukan JSON */
            }
            reject(new Error(detail ? `Penyimpanan menolak berkas: ${detail}` : 'Unggah ke penyimpanan gagal. Periksa format dan ukuran berkas.'));
        };
        xhr.onerror = () => reject(new Error('Koneksi terputus saat mengunggah. Coba lagi.'));
        xhr.send(form);
    });
}

const percent = (fraction: number) => `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%`;

/**
 * Unggah langsung ke Cloudinary dengan tanda tangan dari server; server memverifikasi ulang sebelum berkas tampil.
 * Foto/video dikompres di browser dulu (HEIC → JPEG, MOV → MP4) agar kecil tetapi tetap jernih.
 */
export function MediaGallery({ target, targetId, items, label, video = false, pdf = false }: Props) {
    const { media } = usePage<SharedData>().props;
    const input = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [notes, setNotes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [playing, setPlaying] = useState<MediaItem | null>(null);

    const busy = status !== null;
    const accept = [ACCEPT_IMAGE, video ? ACCEPT_VIDEO : '', pdf ? ACCEPT_PDF : ''].filter(Boolean).join(',');

    const send = async (file: File, prefix: string) => {
        const maxBytes = kindOf(file) === 'video' ? media.video_max_bytes : media.max_bytes;

        setStatus(`${prefix}Menyiapkan…`);
        setProgress(0);
        const prepared = await prepareMedia(file, { maxBytes }, (stage, fraction) => {
            setStatus(`${prefix}${stage === 'prepare' ? 'Menyiapkan…' : 'Mengompres…'}`);
            setProgress(fraction);
        });
        if (prepared.kind === 'video' && !video) throw new CompressError('Video tidak bisa ditambahkan di sini.');
        if (prepared.kind === 'document' && !pdf) throw new CompressError('Dokumen PDF tidak bisa ditambahkan di sini.');

        const resource_type = prepared.kind === 'video' ? 'video' : 'image';
        const { asset_id, upload: signed } = await api<{ asset_id: number; upload: { url: string; fields: Record<string, string> } }>(
            '/media/tanda-tangan',
            { target, target_id: targetId, resource_type },
        );

        const form = new FormData();
        Object.entries(signed.fields).forEach(([k, v]) => form.append(k, String(v)));
        form.append('file', prepared.file);

        setStatus(`${prefix}Mengunggah…`);
        setProgress(0);
        // Bila gagal di sini, baris `pending` dibersihkan server (media:prune); klien tidak perlu membatalkan apa pun.
        await upload(signed.url, form, setProgress);
        await api(`/media/${asset_id}/konfirmasi`);

        if (prepared.changed) return `${file.name}: ${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.file.size)}`;

        return null;
    };

    const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (files.length === 0) return;

        setError(null);
        setNotes([]);
        const problems: string[] = [];
        const done: string[] = [];

        for (const [i, file] of files.entries()) {
            const prefix = files.length > 1 ? `(${i + 1}/${files.length}) ` : '';
            try {
                const note = await send(file, prefix);
                if (note) done.push(note);
            } catch (err) {
                problems.push(`${file.name}: ${err instanceof Error ? err.message : 'Unggah gagal.'}`);
            }
        }

        setStatus(null);
        setNotes(done);
        if (problems.length > 0) setError(problems.join(' '));
        router.reload();
    };

    return (
        <div className="space-y-2">
            {items.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {items.map((m) => (
                        <li key={m.id} className="border-line relative size-24 overflow-hidden rounded-md border">
                            {m.kind === 'video' ? (
                                <button type="button" className="relative flex size-full items-center justify-center" onClick={() => setPlaying(m)}>
                                    <img src={`/media/${m.id}/poster`} alt="" loading="lazy" className="size-full object-cover" />
                                    <span className="bg-ink/55 text-paper absolute flex size-9 items-center justify-center rounded-full">
                                        <Play className="size-4 translate-x-px" fill="currentColor" aria-hidden="true" />
                                    </span>
                                    <span className="sr-only">Putar video</span>
                                </button>
                            ) : (
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
                            )}
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

            <input ref={input} type="file" accept={accept} multiple className="sr-only" tabIndex={-1} onChange={onPick} aria-label={label} />
            <Button type="button" variant="outline" size="sm" className="h-11" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                    <Paperclip className="size-4" strokeWidth={1.5} aria-hidden="true" />
                )}
                {busy ? `${status} ${percent(progress)}` : label}
            </Button>
            {busy && (
                <div
                    role="progressbar"
                    aria-label={status ?? undefined}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                    className="bg-line h-1 w-full max-w-xs rounded"
                >
                    <div className="bg-coral h-full rounded transition-[width]" style={{ width: percent(progress) }} />
                </div>
            )}
            {notes.length > 0 && (
                <p role="status" className="text-ink-faint text-xs">
                    Dikompres: {notes.join('; ')}
                </p>
            )}
            {error && (
                <p role="alert" className="text-danger text-sm">
                    {error}
                </p>
            )}

            <Dialog open={playing !== null} onOpenChange={(o) => !o && setPlaying(null)}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogTitle className="sr-only">Putar video</DialogTitle>
                    <DialogDescription className="sr-only">Video kenangan</DialogDescription>
                    {playing && (
                        <video
                            key={playing.id}
                            src={`/media/${playing.id}`}
                            poster={`/media/${playing.id}/poster`}
                            controls
                            autoPlay
                            playsInline
                            className="bg-ink max-h-[75vh] w-full rounded-md"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
