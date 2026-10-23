<?php

namespace App\Domain\Vendors;

class VendorComparison
{
    /**
     * Rata-rata tertimbang skor 1–5 hanya atas kriteria yang sudah dinilai, supaya kriteria kosong
     * tidak menarik nilai ke bawah. Null bila belum ada skor sama sekali.
     *
     * @param  array<int,int>  $scores  criterion id => skor
     * @param  array<int,int>  $weights  criterion id => bobot
     */
    public function weightedScore(array $scores, array $weights): ?float
    {
        $sum = 0;
        $weightSum = 0;

        foreach ($scores as $criterionId => $score) {
            $weight = $weights[$criterionId] ?? 0;
            $sum += $score * $weight;
            $weightSum += $weight;
        }

        return $weightSum > 0 ? round($sum / $weightSum, 1) : null;
    }

    /** Selisih penawaran terhadap estimasi anggaran: positif = lebih mahal dari estimasi. */
    public function differenceFromEstimate(?int $quotedPrice, ?int $estimate): ?int
    {
        if ($quotedPrice === null || $estimate === null || $estimate === 0) {
            return null;
        }

        return $quotedPrice - $estimate;
    }
}
