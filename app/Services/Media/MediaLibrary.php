<?php

namespace App\Services\Media;

use App\Models\MediaAsset;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/** Logika unggahan di sisi server: folder, public_id, verifikasi ulang, dan pembersihan. */
class MediaLibrary
{
    public function __construct(private MediaStorage $storage) {}

    /** public_id ditentukan server: {root}/weddings/{id}/{target}/{id}/{acak}. */
    public function publicId(int $weddingId, string $target, int $targetId): string
    {
        return sprintf('%s/weddings/%d/%s/%d/%s', trim(config('media.root_folder'), '/'), $weddingId, $target, $targetId, Str::lower(Str::random(24)));
    }

    /**
     * Memverifikasi aset yang diklaim sudah diunggah. Bila tidak valid, aset (jika ada) dan barisnya dihapus.
     *
     * @param  list<string>  $formats
     * @return string|null pesan galat, null bila valid
     */
    public function confirm(MediaAsset $asset, array $formats): ?string
    {
        $info = $this->storage->inspect($asset->public_id);

        if ($info === null) {
            return 'Berkas belum ditemukan di penyimpanan. Coba unggah ulang.';
        }

        $format = strtolower((string) $info['format']);
        $error = null;

        if (! in_array($format, $formats, true)) {
            $error = 'Format berkas tidak diizinkan.';
        } elseif ($info['bytes'] > config('media.max_bytes')) {
            $error = 'Ukuran berkas melebihi batas '.round(config('media.max_bytes') / 1048576).' MB.';
        }

        if ($error) {
            $this->purge($asset);

            return $error;
        }

        $asset->forceFill([
            'status' => 'ready',
            'kind' => $format === 'pdf' ? 'document' : 'photo',
            'format' => $format,
            'bytes' => $info['bytes'],
            'width' => $info['width'],
            'height' => $info['height'],
        ])->save();

        return null;
    }

    /** Hapus di penyimpanan dulu; baris DB hanya dihapus bila itu berhasil. */
    public function purge(MediaAsset $asset): bool
    {
        if (! $this->storage->delete($asset->public_id)) {
            return false;
        }

        $asset->delete();

        return true;
    }

    /** Hapus semua media milik sebuah model (dipanggil saat model dihapus). */
    public function purgeFor(Model $model): void
    {
        MediaAsset::where('mediable_type', $model->getMorphClass())->where('mediable_id', $model->getKey())->get()
            ->each(fn (MediaAsset $a) => $this->purge($a));
    }
}
