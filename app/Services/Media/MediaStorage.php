<?php

namespace App\Services\Media;

use App\Models\MediaAsset;

/** Satu-satunya pintu ke penyimpanan media. Implementasi produksi: CloudinaryService; test memakai fake. */
interface MediaStorage
{
    public function isConfigured(): bool;

    /**
     * Parameter unggah bertanda tangan untuk klien (secret tidak pernah dikirim).
     *
     * @param  list<string>  $formats
     * @param  'image'|'video'  $resourceType  jenis aset di penyimpanan (PDF termasuk `image`)
     * @return array{url:string,fields:array<string,string|int>}
     */
    public function signUpload(string $publicId, array $formats, string $resourceType = 'image'): array;

    /**
     * Memeriksa aset di penyimpanan; null bila belum ada.
     *
     * @param  'image'|'video'  $resourceType
     * @return array{format:?string,bytes:int,width:?int,height:?int}|null
     */
    public function inspect(string $publicId, string $resourceType = 'image'): ?array;

    /**
     * True bila aset terhapus atau memang sudah tidak ada.
     *
     * @param  'image'|'video'  $resourceType
     */
    public function delete(string $publicId, string $resourceType = 'image'): bool;

    /** URL bertanda tangan untuk menampilkan aset privat (video dikirim sebagai MP4 agar bisa diputar di semua browser). */
    public function url(MediaAsset $asset): string;

    /** URL bertanda tangan untuk gambar sampul sebuah video. */
    public function posterUrl(MediaAsset $asset): string;
}
