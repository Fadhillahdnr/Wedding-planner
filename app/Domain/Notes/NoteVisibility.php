<?php

namespace App\Domain\Notes;

use Carbon\CarbonInterface;

/** Aturan siapa boleh membaca catatan. Satu-satunya tempat aturan ini didefinisikan. */
final class NoteVisibility
{
    public const SHARED = 'shared';

    public const PRIVATE = 'private';

    /**
     * Penulis selalu bisa membaca catatannya sendiri. Pasangan hanya bisa membaca catatan
     * `shared` yang tanggal bukanya (jika ada) sudah tiba.
     */
    public static function canRead(int $viewerId, int $authorId, string $visibility, ?CarbonInterface $revealOn, CarbonInterface $today): bool
    {
        if ($viewerId === $authorId) {
            return true;
        }

        return $visibility === self::SHARED && ($revealOn === null || $revealOn->startOfDay()->lessThanOrEqualTo($today->copy()->startOfDay()));
    }
}
