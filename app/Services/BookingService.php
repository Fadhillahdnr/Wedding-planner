<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /** @param array{package_id?:?int,vendor_id?:?int,event_id?:?int,preferred_date:string,notes?:?string} $data */
    public function create(User $user, array $data): Booking
    {
        return DB::transaction(function () use ($user, $data) {
            $this->assertNoConflict($user, $data);

            $booking = Booking::create([...$data, 'user_id' => $user->id, 'status' => BookingStatus::Pending]);

            $booking->histories()->create([
                'actor_id' => $user->id,
                'from_status' => null,
                'to_status' => BookingStatus::Pending->value,
                'note' => 'Permintaan booking dibuat.',
            ]);

            return $booking;
        });
    }

    /**
     * Cegah duplikasi: pengguna yang sama tidak boleh punya booking aktif untuk
     * paket/vendor + tanggal yang sama.
     */
    private function assertNoConflict(User $user, array $data): void
    {
        $active = array_map(fn (BookingStatus $s) => $s->value, array_filter(BookingStatus::cases(), fn ($s) => $s->isActive()));

        $exists = Booking::query()
            ->where('user_id', $user->id)
            ->whereDate('preferred_date', $data['preferred_date'])
            ->whereIn('status', $active)
            ->when($data['package_id'] ?? null, fn ($q, $id) => $q->where('package_id', $id))
            ->when($data['vendor_id'] ?? null, fn ($q, $id) => $q->where('vendor_id', $id))
            ->lockForUpdate()
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'preferred_date' => 'Anda sudah memiliki booking aktif untuk layanan dan tanggal ini.',
            ]);
        }
    }

    public function transition(Booking $booking, BookingStatus $to, User $actor, ?string $note = null): Booking
    {
        return DB::transaction(function () use ($booking, $to, $actor, $note) {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $from = $booking->status;

            if (! $from->canTransitionTo($to)) {
                throw ValidationException::withMessages([
                    'status' => "Status tidak dapat diubah dari {$from->label()} ke {$to->label()}.",
                ]);
            }

            $booking->update(['status' => $to]);

            BookingStatusHistory::create([
                'booking_id' => $booking->id,
                'actor_id' => $actor->id,
                'from_status' => $from->value,
                'to_status' => $to->value,
                'note' => $note,
            ]);

            return $booking;
        });
    }
}
