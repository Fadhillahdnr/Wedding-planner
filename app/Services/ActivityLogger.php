<?php

namespace App\Services;

use App\Models\ActivityLog;

/** Mencatat aksi sensitif (ubah anggaran total, hapus, anggota, hari H). Tanpa data pribadi atau nominal berlebih. */
class ActivityLogger
{
    /** @param  array<string,mixed>  $context */
    public function record(string $action, array $context = []): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'context' => $context ?: null,
        ]);
    }
}
