/**
 * Kompresi media di browser SEBELUM diunggah ke Cloudinary (server tidak memproses berkas).
 *
 * - Gambar: HEIC/HEIF di-decode (heic-to), EXIF orientation diterapkan, sisi terpanjang dibatasi
 *   2560 px, lalu di-encode JPEG kualitas 0,86 (tidak terlihat bedanya di layar, ukuran turun 70–90%).
 *   Berkas yang sudah kecil dan bukan HEIC dikirim apa adanya; hasil kompresi yang justru lebih besar dibuang.
 * - Video: MOV/MP4/WebM di-transcode lewat WebCodecs (mediabunny) ke MP4 H.264 + AAC, maks. 1080p / 30 fps,
 *   bitrate disesuaikan dengan durasi agar selalu di bawah batas ukuran. Video yang sudah cukup hemat tidak diproses ulang.
 * - Bila kompresi tidak didukung browser, berkas asli dikirim hanya jika masih muat dalam batas ukuran.
 */

export type MediaKind = 'image' | 'video' | 'document';

export const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
export const ACCEPT_VIDEO = 'video/mp4,video/quicktime,video/webm,.mov,.mp4,.webm';
export const ACCEPT_PDF = 'application/pdf';

/** Batas berkas MENTAH yang boleh dipilih (sebelum dikompres); batas hasil akhir datang dari server. */
export const RAW_LIMIT = { image: 60 * 1024 * 1024, video: 1024 * 1024 * 1024, document: 10 * 1024 * 1024 } as const;

const IMAGE_MAX_EDGE = 2560;
const IMAGE_QUALITY = 0.86;
/** Gambar non-HEIC di bawah ukuran ini dan dalam batas sisi dikirim apa adanya. */
const IMAGE_KEEP_UNDER = 1.2 * 1024 * 1024;

const VIDEO_MAX_SHORT_EDGE = 1080;
const VIDEO_MAX_LONG_EDGE = 1920;
const VIDEO_MAX_FPS = 30;
/** Bit per piksel per frame; ±5,3 Mbps untuk 1080p30, jernih untuk rekaman ponsel. */
const VIDEO_BITS_PER_PIXEL = 0.085;
const VIDEO_MIN_BITRATE = 700_000;
const AUDIO_BITRATE = 128_000;

export interface Limits {
    /** Batas ukuran hasil akhir (byte) menurut server. */
    maxBytes: number;
}

export interface Prepared {
    file: File;
    kind: MediaKind;
    originalBytes: number;
    /** True bila berkas dikompres/diubah; false bila dikirim apa adanya. */
    changed: boolean;
}

export class CompressError extends Error {}

/** Codec/encoder tidak tersedia di browser ini (bukan kesalahan pengguna). */
class UnsupportedError extends Error {}

type Progress = (stage: 'prepare' | 'compress', fraction: number) => void;

const ext = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';
const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'berkas';
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export function kindOf(file: File): MediaKind {
    const e = ext(file.name);
    if (file.type.startsWith('video/') || ['mov', 'mp4', 'm4v', 'webm'].includes(e)) return 'video';
    if (file.type === 'application/pdf' || e === 'pdf') return 'document';

    return 'image';
}

const isHeicFile = (file: File) => ['heic', 'heif'].includes(ext(file.name)) || /^image\/hei[cf]/.test(file.type);

export function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1).replace('.', ',')} MB`;

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Memilih cara memproses berkas lalu mengembalikan berkas siap unggah. */
export async function prepareMedia(file: File, limits: Limits, onProgress?: Progress): Promise<Prepared> {
    const kind = kindOf(file);
    if (file.size > RAW_LIMIT[kind]) {
        throw new CompressError(`Berkas terlalu besar (maks. ${formatBytes(RAW_LIMIT[kind])} sebelum dikompres).`);
    }

    if (kind === 'document') {
        if (file.size > limits.maxBytes) throw new CompressError(`Ukuran dokumen maksimal ${formatBytes(limits.maxBytes)}.`);

        return { file, kind, originalBytes: file.size, changed: false };
    }

    const result = kind === 'video' ? await prepareVideo(file, limits, onProgress) : await prepareImage(file, limits, onProgress);

    return { file: result, kind, originalBytes: file.size, changed: result !== file };
}

/* ------------------------------------------------------------------ gambar */

async function decodeImage(file: File): Promise<ImageBitmap> {
    try {
        return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (error) {
        if (!isHeicFile(file)) throw error;
    }

    // Chrome/Firefox tidak bisa membuka HEIC: decode dengan libheif (dimuat hanya saat dibutuhkan).
    const { heicTo } = await import('heic-to');
    const jpeg = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.95 });

    return createImageBitmap(jpeg);
}

function encodeJpeg(bitmap: ImageBitmap, scale: number, quality: number): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new CompressError('Browser tidak mendukung pemrosesan gambar.');
    // Latar putih agar PNG transparan tidak menjadi hitam saat dijadikan JPEG.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new CompressError('Gagal mengompres gambar.'))), 'image/jpeg', quality),
    );
}

async function prepareImage(file: File, { maxBytes }: Limits, onProgress?: Progress): Promise<File> {
    onProgress?.('prepare', 0);
    const heic = isHeicFile(file);
    let bitmap: ImageBitmap;
    try {
        bitmap = await decodeImage(file);
    } catch {
        // Tidak bisa dibaca browser: kirim asli bila muat (Cloudinary mengonversi HEIC sendiri), jika tidak beri tahu.
        if (file.size <= maxBytes) return file;
        throw new CompressError('Gambar tidak bisa dibaca di browser ini dan terlalu besar. Coba ekspor sebagai JPEG.');
    }

    try {
        const longEdge = Math.max(bitmap.width, bitmap.height);
        const withinEdge = longEdge <= IMAGE_MAX_EDGE;
        if (!heic && withinEdge && file.size <= IMAGE_KEEP_UNDER) return file;

        onProgress?.('compress', 0.3);
        let scale = Math.min(1, IMAGE_MAX_EDGE / longEdge);
        let quality = IMAGE_QUALITY;
        let blob = await encodeJpeg(bitmap, scale, quality);

        // Masih di atas batas (foto sangat detail): turunkan bertahap, tidak lebih dari yang perlu.
        for (const step of [
            { q: 0.8, s: 1 },
            { q: 0.76, s: 0.8 },
            { q: 0.72, s: 0.65 },
        ]) {
            if (blob.size <= maxBytes) break;
            quality = step.q;
            scale = Math.min(1, IMAGE_MAX_EDGE / longEdge) * step.s;
            blob = await encodeJpeg(bitmap, scale, quality);
        }
        if (blob.size > maxBytes) throw new CompressError(`Gambar masih lebih dari ${formatBytes(maxBytes)} setelah dikompres.`);

        // Kompresi yang tidak menghemat apa pun dibuang (kecuali HEIC yang memang harus diubah).
        if (!heic && blob.size >= file.size && file.size <= maxBytes) return file;

        onProgress?.('compress', 1);

        return new File([blob], `${baseName(file.name)}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified });
    } finally {
        bitmap.close();
    }
}

/* ------------------------------------------------------------------- video */

/** Bitrate video (bit/detik) yang dijamin menghasilkan berkas di bawah batas, atau null bila durasi terlalu panjang. */
export function videoBitrate(width: number, height: number, fps: number, duration: number, maxBytes: number): number | null {
    const wanted = width * height * Math.min(fps, VIDEO_MAX_FPS) * VIDEO_BITS_PER_PIXEL;
    // Sisakan 8% untuk container dan variasi encoder, lalu kurangi audio.
    const budget = (maxBytes * 0.92 * 8) / Math.max(duration, 1) - AUDIO_BITRATE * 1.05;
    const bitrate = Math.min(wanted, budget);

    return bitrate >= VIDEO_MIN_BITRATE ? Math.round(bitrate) : null;
}

async function prepareVideo(file: File, { maxBytes }: Limits, onProgress?: Progress): Promise<File> {
    const fallback = () => {
        if (file.size <= maxBytes) return file;
        throw new CompressError(
            `Browser ini belum bisa mengompres video, sedangkan berkas melebihi ${formatBytes(maxBytes)}. Gunakan Chrome, Edge, atau Safari terbaru.`,
        );
    };

    if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') return fallback();

    onProgress?.('prepare', 0);
    const mb = await import('mediabunny');
    const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });

    try {
        const track = await input.getPrimaryVideoTrack();
        if (!track) throw new CompressError('Berkas ini tidak berisi video yang bisa dibaca.');

        const [srcW, srcH, duration, stats, codec] = await Promise.all([
            track.getDisplayWidth(),
            track.getDisplayHeight(),
            input.computeDuration(),
            track.computePacketStats(120),
            track.getCodec(),
        ]);

        const scale = Math.min(1, VIDEO_MAX_SHORT_EDGE / Math.min(srcW, srcH), VIDEO_MAX_LONG_EDGE / Math.max(srcW, srcH));
        const width = even(srcW * scale);
        const height = even(srcH * scale);
        const fps = stats.averagePacketRate || 30;
        const target = videoBitrate(width, height, fps, duration, maxBytes);
        if (target === null) {
            const minutes = Math.floor((maxBytes * 0.92 * 8) / (VIDEO_MIN_BITRATE + AUDIO_BITRATE) / 60);
            throw new CompressError(`Video terlalu panjang untuk batas ${formatBytes(maxBytes)} (maks. sekitar ${minutes} menit).`);
        }

        // Sudah hemat, ukuran layar wajar, dan cukup kecil: tidak perlu diproses ulang.
        const alreadyLean =
            stats.averageBitrate <= target * 1.1 && scale === 1 && fps <= VIDEO_MAX_FPS + 1 && file.size <= maxBytes && codec === 'avc';
        if (alreadyLean) return file;

        if (!(await mb.canEncodeVideo('avc', { width, height, bitrate: target }))) return fallback();

        const encodeOnce = async (bitrate: number): Promise<File> => {
            const output = new mb.Output({ format: new mb.Mp4OutputFormat(), target: new mb.BufferTarget() });
            const aac = await mb.canEncodeAudio('aac');
            const conversion = await mb.Conversion.init({
                input,
                output,
                video: {
                    width,
                    height,
                    fit: 'contain',
                    codec: 'avc',
                    quality: new mb.Quality({ bitrate }),
                    ...(fps > VIDEO_MAX_FPS + 1 ? { frameRate: VIDEO_MAX_FPS } : {}),
                },
                audio: { ...(aac ? { codec: 'aac' as const } : {}), quality: new mb.Quality({ bitrate: AUDIO_BITRATE }) },
            });

            if (!conversion.isValid || conversion.discardedTracks.some((d) => d.track.isVideoTrack())) {
                throw new UnsupportedError();
            }
            conversion.onProgress = (p) => onProgress?.('compress', p);
            await conversion.execute();

            const buffer = output.target.buffer;
            if (!buffer) throw new CompressError('Kompresi video gagal.');

            return new File([buffer], `${baseName(file.name)}.mp4`, { type: 'video/mp4', lastModified: file.lastModified });
        };

        let result = await encodeOnce(target);
        // Encoder kadang melampaui target bitrate: ulangi sekali dengan bitrate lebih rendah.
        if (result.size > maxBytes) result = await encodeOnce(Math.max(VIDEO_MIN_BITRATE, Math.round(target * 0.65)));
        if (result.size > maxBytes) throw new CompressError(`Video masih lebih dari ${formatBytes(maxBytes)} setelah dikompres.`);

        // Hasil yang tidak lebih kecil tidak berguna, kecuali berkas asli memang terlalu besar atau bukan MP4.
        if (result.size >= file.size && file.size <= maxBytes && ext(file.name) === 'mp4') return file;

        return result;
    } catch (error) {
        if (error instanceof CompressError) throw error;
        // Codec tidak didukung (mis. HEVC di Firefox) atau WebCodecs gagal: kirim asli bila muat.
        return fallback();
    } finally {
        input.dispose();
    }
}
