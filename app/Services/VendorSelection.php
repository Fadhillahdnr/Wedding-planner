<?php

namespace App\Services;

use App\Enums\CandidateStatus;
use App\Models\VendorCandidate;
use Illuminate\Support\Facades\DB;

class VendorSelection
{
    public function __construct(private readonly ActivityLogger $log) {}

    /**
     * Menjadikan kandidat sebagai pilihan tunggal slot-nya. Kandidat terpilih sebelumnya turun ke negosiasi
     * (database juga menjaga lewat unique partial index). Kesepakatan anggaran hanya diubah bila diminta.
     */
    public function choose(VendorCandidate $candidate, bool $applyPrice): void
    {
        DB::transaction(function () use ($candidate, $applyPrice) {
            $slot = $candidate->slot()->lockForUpdate()->firstOrFail();

            VendorCandidate::query()
                ->where('vendor_slot_id', $slot->id)
                ->where('status', CandidateStatus::Chosen->value)
                ->where('id', '!=', $candidate->id)
                ->update(['status' => CandidateStatus::Negotiating->value]);

            $candidate->update(['status' => CandidateStatus::Chosen->value]);

            if ($applyPrice && $candidate->quoted_price !== null && $slot->budgetItem) {
                $slot->budgetItem->update(['agreed_amount' => $candidate->quoted_price]);
            }

            $this->log->record('vendor.chosen', ['slot' => $slot->name, 'price_applied' => $applyPrice]);
        });
    }
}
