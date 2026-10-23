<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoveNote extends Model
{
    use BelongsToWedding;

    protected $fillable = ['title', 'body', 'visibility', 'reveal_on'];

    protected function casts(): array
    {
        return ['reveal_on' => 'date'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Catatan yang boleh dibaca pengguna: milik sendiri, atau `shared` yang sudah dibuka.
     * Dicocokkan dengan NoteVisibility::canRead; difilter di SQL agar catatan terjadwal tidak pernah ikut termuat.
     */
    public function scopeReadableBy(Builder $query, User $user, string $today): Builder
    {
        return $query->where(fn (Builder $q) => $q
            ->where('author_id', $user->id)
            ->orWhere(fn (Builder $q) => $q
                ->where('visibility', 'shared')
                ->where(fn (Builder $q) => $q->whereNull('reveal_on')->orWhereDate('reveal_on', '<=', $today))));
    }
}
