<?php

namespace App\Enums;

enum BudgetStatus: string
{
    case Unknown = 'belum_diatur';
    case Safe = 'aman';
    case Near = 'mendekati';
    case Over = 'melebihi';

    public function label(): string
    {
        return match ($this) {
            self::Unknown => 'Anggaran belum diatur',
            self::Safe => 'Aman',
            self::Near => 'Mendekati batas',
            self::Over => 'Melebihi anggaran',
        };
    }
}
