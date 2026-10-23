<?php

namespace App\Domain\Budget;

use InvalidArgumentException;

/**
 * Membagi total anggaran ke kategori template. Template hanyalah titik awal yang umum;
 * pengguna bebas mengubah tiap angka setelahnya.
 */
class BudgetAllocator
{
    /** Bobot umum (persen) tanpa dana tak terduga; berjumlah 94 dan skalanya menyesuaikan sisa. */
    public const TEMPLATE_WEIGHTS = [
        'Venue & katering' => 45,
        'Dekorasi' => 10,
        'Dokumentasi' => 10,
        'Rias & busana' => 10,
        'Hiburan & MC' => 4,
        'Undangan & souvenir' => 4,
        'Seserahan, mahar & cincin' => 7,
        'Administrasi' => 1,
        'Transport & akomodasi' => 3,
    ];

    /**
     * @param  array<string,int>  $weights  nama kategori => bobot relatif
     * @return array{categories:array<string,int>,contingency:int}
     */
    public function allocate(int $total, int $contingencyPercent, array $weights = self::TEMPLATE_WEIGHTS): array
    {
        if ($total < 0 || $weights === [] || array_sum($weights) <= 0) {
            throw new InvalidArgumentException('Total dan bobot alokasi harus valid.');
        }

        $contingency = intdiv($total * $contingencyPercent + 50, 100);
        $distributable = $total - $contingency;
        $weightSum = array_sum($weights);

        $categories = [];
        foreach ($weights as $name => $weight) {
            $categories[$name] = intdiv($distributable * $weight, $weightSum);
        }

        // Sisa pembulatan masuk ke kategori terbesar agar jumlahnya selalu persis sama dengan total.
        $remainder = $distributable - array_sum($categories);
        $largest = array_search(max($weights), $weights, true);
        $categories[$largest] += $remainder;

        return ['categories' => $categories, 'contingency' => $contingency];
    }
}
