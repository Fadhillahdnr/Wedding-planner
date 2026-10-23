<?php

namespace App\Console\Commands;

use App\Models\MediaAsset;
use App\Services\Media\MediaLibrary;
use Illuminate\Console\Command;

class PruneMedia extends Command
{
    protected $signature = 'media:prune';

    protected $description = 'Hapus aset yatim: unggahan yang tak pernah dikonfirmasi dan aset yang induknya sudah terhapus.';

    public function handle(MediaLibrary $library): int
    {
        $removed = 0;
        $kept = 0;

        $stale = MediaAsset::withoutGlobalScopes()
            ->where('status', 'pending')
            ->where('created_at', '<', now()->subHours(config('media.pending_ttl_hours')))
            ->get();

        $orphans = MediaAsset::withoutGlobalScopes()->whereNotNull('mediable_type')->get()
            ->filter(fn (MediaAsset $a) => ! $a->mediable()->withoutGlobalScopes()->exists());

        foreach ($stale->merge($orphans)->unique('id') as $asset) {
            $library->purge($asset) ? $removed++ : $kept++;
        }

        $this->info("Dihapus: {$removed}. Gagal (dicoba lagi nanti): {$kept}.");

        return self::SUCCESS;
    }
}
