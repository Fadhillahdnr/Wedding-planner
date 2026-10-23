<?php

namespace App\Models\Concerns;

use App\Models\Wedding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Membatasi semua query ke workspace pengguna yang sedang login. Record milik workspace lain
 * tidak pernah ditemukan (route binding menghasilkan 404), sehingga tidak ada celah IDOR.
 * Di luar request (artisan, seeder) tidak ada pengguna, jadi scope tidak diterapkan.
 */
trait BelongsToWedding
{
    protected static function bootBelongsToWedding(): void
    {
        static::addGlobalScope('wedding', function (Builder $query) {
            $weddingId = auth()->user()?->weddingId();

            if ($weddingId !== null) {
                $query->where($query->getModel()->getTable().'.wedding_id', $weddingId);
            } elseif (auth()->check()) {
                // Pengguna login tanpa workspace tidak boleh melihat apa pun.
                $query->whereRaw('1 = 0');
            }
        });

        static::creating(function ($model) {
            $model->wedding_id ??= auth()->user()?->weddingId();
        });
    }

    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
