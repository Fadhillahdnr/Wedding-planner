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
     * @return array{url:string,fields:array<string,string|int>}
     */
    public function signUpload(string $publicId, array $formats): array;

    /**
     * Memeriksa aset di penyimpanan; null bila belum ada.
     *
     * @return array{format:?string,bytes:int,width:?int,height:?int}|null
     */
    public function inspect(string $publicId): ?array;

    /** True bila aset terhapus atau memang sudah tidak ada. */
    public function delete(string $publicId): bool;

    /** URL bertanda tangan untuk menampilkan aset privat. */
    public function url(MediaAsset $asset): string;
}
