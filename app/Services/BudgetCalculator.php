<?php

namespace App\Services;

use App\Models\Event;

class BudgetCalculator
{
    /**
     * Semua angka dihitung dalam sen (integer) untuk menghindari galat floating-point.
     *
     * @return array{total:string,estimated:string,actual:string,remaining:string,over_budget:bool}
     */
    public function summarize(Event $event): array
    {
        $items = $event->budgetItems()->get(['estimated', 'actual']);
        $cents = fn ($v) => (int) round(((float) $v) * 100);

        $estimated = $items->sum(fn ($i) => $cents($i->estimated));
        $actual = $items->sum(fn ($i) => $cents($i->actual));
        $total = $cents($event->budget_total);
        $remaining = $total - $actual;

        $fmt = fn (int $c) => number_format($c / 100, 2, '.', '');

        return [
            'total' => $fmt($total),
            'estimated' => $fmt($estimated),
            'actual' => $fmt($actual),
            'remaining' => $fmt($remaining),
            'over_budget' => $remaining < 0,
        ];
    }
}
