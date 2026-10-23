<?php

namespace App\Services\Cloudinary;

use App\Models\Event;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * Satu-satunya pintu masuk ke Cloudinary. Controller tidak menyentuh SDK secara langsung.
 */
class CloudinaryService
{
    public function __construct(private readonly CloudinaryGateway $gateway) {}

    public function isConfigured(): bool
    {
        return filled(config('cloudinary.cloud_name'))
            && filled(config('cloudinary.api_key'))
            && filled(config('cloudinary.api_secret'));
    }

    /**
     * Folder tujuan upload. Hanya staf yang boleh ke folder global;
     * customer hanya ke folder event miliknya sendiri.
     */
    public function resolveFolder(User $user, string $collection, ?Event $event): string
    {
        $root = trim((string) config('cloudinary.root_folder'), '/');

        if ($collection === 'event') {
            if (! $event || (! $user->isStaff() && $event->user_id !== $user->id)) {
                throw ValidationException::withMessages(['event_id' => 'Event tidak ditemukan atau bukan milik Anda.']);
            }

            return "$root/events/{$event->id}";
        }

        if (! $user->isStaff()) {
            throw ValidationException::withMessages(['collection' => 'Anda tidak berwenang mengunggah ke koleksi ini.']);
        }

        return match ($collection) {
            'portfolio' => "$root/portfolio",
            'vendors' => "$root/vendors",
            'audio' => "$root/audio",
            default => throw ValidationException::withMessages(['collection' => 'Koleksi tidak dikenal.']),
        };
    }

    /**
     * Parameter upload bertanda tangan untuk upload langsung dari browser.
     * API secret tidak pernah keluar dari server.
     *
     * @return array{cloud_name:string,api_key:string,timestamp:int,folder:string,signature:string,resource_type:string,type:string,upload_url:string,max_bytes:int,allowed_formats:list<string>}
     */
    public function signUpload(string $folder, string $resourceType, bool $private): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Cloudinary belum dikonfigurasi. Isi CLOUDINARY_* di .env.');
        }

        $type = $private ? 'authenticated' : 'upload';
        $params = ['folder' => $folder, 'timestamp' => time(), 'type' => $type];

        return [
            ...$params,
            'signature' => $this->gateway->sign($params),
            'cloud_name' => (string) config('cloudinary.cloud_name'),
            'api_key' => (string) config('cloudinary.api_key'),
            'resource_type' => $resourceType === 'audio' ? 'video' : $resourceType,
            'upload_url' => 'https://api.cloudinary.com/v1_1/'.config('cloudinary.cloud_name').'/'.($resourceType === 'audio' ? 'video' : $resourceType).'/upload',
            'max_bytes' => (int) config("cloudinary.max_bytes.$resourceType"),
            'allowed_formats' => config("cloudinary.allowed_formats.$resourceType"),
        ];
    }

    /**
     * Simpan metadata aset setelah browser selesai upload.
     * public_id wajib berada di bawah folder yang telah diotorisasi — bukan nilai bebas dari klien.
     *
     * @param  array<string,mixed>  $payload
     */
    public function recordUpload(User $user, string $folder, string $resourceType, array $payload, array $meta = []): MediaAsset
    {
        $publicId = (string) ($payload['public_id'] ?? '');

        if (! str_starts_with($publicId, $folder.'/') || str_contains($publicId, '..')) {
            throw ValidationException::withMessages(['public_id' => 'Aset tidak berada di folder yang diizinkan.']);
        }

        $format = strtolower((string) ($payload['format'] ?? ''));
        if (! in_array($format, config("cloudinary.allowed_formats.$resourceType", []), true)) {
            throw ValidationException::withMessages(['format' => 'Format file tidak diizinkan.']);
        }

        $bytes = (int) ($payload['bytes'] ?? 0);
        if ($bytes <= 0 || $bytes > (int) config("cloudinary.max_bytes.$resourceType")) {
            throw ValidationException::withMessages(['bytes' => 'Ukuran file melebihi batas.']);
        }

        $url = (string) ($payload['secure_url'] ?? '');
        if (! str_starts_with($url, 'https://res.cloudinary.com/'.config('cloudinary.cloud_name').'/')) {
            throw ValidationException::withMessages(['secure_url' => 'URL aset tidak valid.']);
        }

        return MediaAsset::create([
            'mediable_type' => $meta['mediable_type'] ?? null,
            'mediable_id' => $meta['mediable_id'] ?? null,
            'uploaded_by' => $user->id,
            'provider' => 'cloudinary',
            'public_id' => $publicId,
            'resource_type' => $resourceType,
            'format' => $format,
            'secure_url' => $url,
            'width' => $payload['width'] ?? null,
            'height' => $payload['height'] ?? null,
            'duration' => $payload['duration'] ?? null,
            'bytes' => $bytes,
            'alt_text' => $meta['alt_text'] ?? null,
            'visibility' => $meta['visibility'] ?? 'public',
            'collection' => $meta['collection'] ?? null,
        ]);
    }

    /**
     * Hapus di Cloudinary dulu; record DB hanya dihapus bila Cloudinary berhasil,
     * sehingga tidak ada aset yatim yang tak terlacak.
     */
    public function delete(MediaAsset $asset): void
    {
        $remote = $asset->resource_type === 'audio' ? 'video' : $asset->resource_type;

        DB::transaction(function () use ($asset, $remote) {
            $asset->delete();

            if (! $this->gateway->destroy($asset->public_id, $remote, $asset->isPrivate())) {
                throw new RuntimeException('Gagal menghapus aset di Cloudinary.');
            }
        });
    }

    public function deliveryUrl(MediaAsset $asset): string
    {
        if ($asset->isPrivate()) {
            $remote = $asset->resource_type === 'audio' ? 'video' : $asset->resource_type;

            return $this->gateway->signedUrl($asset->public_id, $remote, $asset->format);
        }

        return $asset->secure_url;
    }
}
