<?php

namespace App\Services\Cloudinary;

interface CloudinaryGateway
{
    /** Hapus aset di Cloudinary. Mengembalikan true bila terhapus atau memang sudah tidak ada. */
    public function destroy(string $publicId, string $resourceType, bool $private = false): bool;

    /** Tanda tangan untuk parameter upload langsung dari browser. */
    public function sign(array $params): string;

    /** URL terproteksi (signed) untuk aset privat. */
    public function signedUrl(string $publicId, string $resourceType, ?string $format): string;
}
