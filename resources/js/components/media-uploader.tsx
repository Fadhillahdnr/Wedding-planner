import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';

type ResourceType = 'image' | 'video' | 'audio';

interface Signature {
    api_key: string;
    timestamp: number;
    folder: string;
    signature: string;
    type: string;
    upload_url: string;
    max_bytes: number;
    allowed_formats: string[];
}

interface Props {
    collection: 'portfolio' | 'vendors' | 'audio' | 'event';
    resourceType?: ResourceType;
    vendorId?: number;
    eventId?: number;
    visibility?: 'public' | 'private';
    label?: string;
    onUploaded?: () => void;
}

const xsrf = () => decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        const first = json.errors ? (Object.values(json.errors)[0] as string[])[0] : undefined;
        throw new Error(first ?? json.message ?? 'Permintaan gagal.');
    }
    return json as T;
}

/** Upload langsung browser → Cloudinary dengan parameter bertanda tangan dari server, lalu catat metadata. */
export function MediaUploader({ collection, resourceType = 'image', vendorId, eventId, visibility, label = 'Unggah gambar', onUploaded }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sendToCloudinary = (sig: Signature, file: File) =>
        new Promise<Record<string, unknown>>((resolve, reject) => {
            const form = new FormData();
            form.append('file', file);
            form.append('api_key', sig.api_key);
            form.append('timestamp', String(sig.timestamp));
            form.append('signature', sig.signature);
            form.append('folder', sig.folder);
            form.append('type', sig.type);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', sig.upload_url);
            xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
            xhr.onload = () => {
                try {
                    const json = JSON.parse(xhr.responseText);
                    if (xhr.status < 300) resolve(json);
                    else reject(new Error(json.error?.message ?? 'Upload ke Cloudinary gagal.'));
                } catch {
                    reject(new Error('Respons Cloudinary tidak valid.'));
                }
            };
            xhr.onerror = () => reject(new Error('Koneksi ke Cloudinary terputus.'));
            xhr.send(form);
        });

    const handle = async (file: File) => {
        setError(null);
        setProgress(0);
        try {
            const scope = { collection, resource_type: resourceType, event_id: eventId, vendor_id: vendorId, visibility };
            const sig = await post<Signature>('/media/signature', scope);

            const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!sig.allowed_formats.includes(ext)) throw new Error(`Format .${ext} tidak diizinkan (${sig.allowed_formats.join(', ')}).`);
            if (file.size > sig.max_bytes) throw new Error(`Ukuran maksimum ${Math.round(sig.max_bytes / 1024 / 1024)} MB.`);

            const up = await sendToCloudinary(sig, file);
            await post('/media', {
                ...scope,
                public_id: up.public_id,
                format: up.format,
                bytes: up.bytes,
                secure_url: up.secure_url,
                width: up.width,
                height: up.height,
                duration: up.duration,
            });
            onUploaded?.();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload gagal.');
        } finally {
            setProgress(null);
            if (input.current) input.current.value = '';
        }
    };

    const accept = resourceType === 'image' ? 'image/*' : resourceType === 'video' ? 'video/*' : 'audio/*';

    return (
        <div className="grid gap-2">
            <input
                ref={input}
                type="file"
                accept={accept}
                className="sr-only"
                tabIndex={-1}
                aria-label={label}
                onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
            />
            <Button type="button" variant="outline" size="sm" disabled={progress !== null} onClick={() => input.current?.click()}>
                {progress !== null ? `Mengunggah… ${progress}%` : label}
            </Button>
            {progress !== null && (
                <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="bg-muted h-1 w-full">
                    <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
                </div>
            )}
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
