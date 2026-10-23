<?php

namespace App\Domain\Budget;

use App\Enums\BudgetStatus;

/**
 * Semua rumus anggaran ada di sini dan hanya di sini (lihat docs/DATABASE.md).
 * Uang selalu integer rupiah; pembagian persen dibulatkan ke rupiah terdekat (setengah ke atas).
 */
class BudgetCalculator
{
    /**
     * @param  array{pricing_mode:string,estimate_min:?int,estimate_max:?int,price_per_guest:?int,agreed_amount:?int}  $item
     * @return array{min:int,max:int,mid:int}
     */
    public function estimate(array $item, ?int $guests): array
    {
        if (($item['pricing_mode'] ?? 'fixed') === 'per_guest') {
            $total = (int) ($item['price_per_guest'] ?? 0) * (int) ($guests ?? 0);

            return ['min' => $total, 'max' => $total, 'mid' => $total];
        }

        $min = $item['estimate_min'] ?? $item['estimate_max'] ?? 0;
        $max = $item['estimate_max'] ?? $item['estimate_min'] ?? 0;

        // Rentang dibalik bila pengguna salah urut; nilai tengah dibulatkan ke bawah.
        [$min, $max] = [min($min, $max), max($min, $max)];

        return ['min' => $min, 'max' => $max, 'mid' => intdiv($min + $max, 2)];
    }

    /**
     * @param  list<array{id:int,pricing_mode:string,estimate_min:?int,estimate_max:?int,price_per_guest:?int,agreed_amount:?int,paid:int}>  $items
     * @return array<string,mixed>
     */
    public function summarize(
        array $items,
        ?int $guests,
        ?int $totalBudget,
        int $contingencyPercent = 0,
        int $priceBufferPercent = 0,
        int $warningPercent = 90,
    ): array {
        $subtotal = 0;
        $rangeMin = 0;
        $rangeMax = 0;
        $agreedTotal = 0;
        $paidTotal = 0;
        $remainingToPay = 0;
        $overpaid = [];
        $perItem = [];

        foreach ($items as $item) {
            $estimate = $this->estimate($item, $guests);
            $agreed = $item['agreed_amount'] ?? null;
            $paid = (int) ($item['paid'] ?? 0);

            // Buffer kenaikan harga hanya untuk item yang belum disepakati.
            $projected = $agreed ?? $estimate['mid'] + $this->percent($estimate['mid'], $priceBufferPercent);

            $subtotal += $projected;
            $rangeMin += $agreed ?? $estimate['min'];
            $rangeMax += $agreed ?? $estimate['max'];
            $paidTotal += $paid;

            if ($agreed !== null) {
                $agreedTotal += $agreed;
                $remainingToPay += max(0, $agreed - $paid);

                if ($paid > $agreed) {
                    $overpaid[] = $item['id'];
                }
            }

            $perItem[$item['id']] = [
                'estimate' => $estimate,
                'agreed' => $agreed,
                'paid' => $paid,
                'projected' => $projected,
            ];
        }

        $contingency = $this->percent($subtotal, $contingencyPercent);
        $projectedTotal = $subtotal + $contingency;

        return [
            'items' => $perItem,
            'subtotal' => $subtotal,
            'contingency' => $contingency,
            'projected_total' => $projectedTotal,
            'projected_range' => ['min' => $rangeMin, 'max' => $rangeMax],
            'agreed_total' => $agreedTotal,
            'paid_total' => $paidTotal,
            'remaining_to_pay' => $remainingToPay,
            'overpaid_items' => $overpaid,
            'total_budget' => $totalBudget,
            'variance' => $totalBudget ? $totalBudget - $projectedTotal : null,
            'status' => $this->status($projectedTotal, $totalBudget, $warningPercent),
        ];
    }

    public function status(int $projectedTotal, ?int $totalBudget, int $warningPercent = 90): BudgetStatus
    {
        // Anggaran 0 atau kosong berarti belum diatur, bukan "melebihi".
        if (! $totalBudget) {
            return BudgetStatus::Unknown;
        }

        if ($projectedTotal > $totalBudget) {
            return BudgetStatus::Over;
        }

        return $projectedTotal * 100 >= $totalBudget * $warningPercent ? BudgetStatus::Near : BudgetStatus::Safe;
    }

    private function percent(int $amount, int $percent): int
    {
        return intdiv($amount * $percent + 50, 100);
    }
}
