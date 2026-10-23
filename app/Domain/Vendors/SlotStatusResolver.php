<?php

namespace App\Domain\Vendors;

use Carbon\CarbonInterface;

/**
 * Status slot diturunkan dari kandidat dan pembayarannya, bukan diisi manual,
 * supaya tidak bisa bertentangan dengan data yang sebenarnya.
 */
class SlotStatusResolver
{
    public const LABELS = [
        'belum_dicari' => 'Belum dicari',
        'riset' => 'Riset',
        'shortlist' => 'Shortlist',
        'survei_terjadwal' => 'Survei terjadwal',
        'sudah_survei' => 'Sudah survei',
        'negosiasi' => 'Negosiasi',
        'terpilih' => 'Terpilih',
        'dp_dibayar' => 'DP dibayar',
        'lunas' => 'Lunas',
    ];

    /**
     * @param  list<string>  $candidateStatuses  status semua kandidat slot
     * @param  list<string>  $upcomingMeetingDates  tanggal pertemuan (Y-m-d) milik kandidat slot
     */
    public function resolve(
        array $candidateStatuses,
        array $upcomingMeetingDates,
        int $agreed,
        int $paid,
        CarbonInterface $today,
    ): string {
        if (in_array('terpilih', $candidateStatuses, true)) {
            if ($agreed > 0 && $paid >= $agreed) {
                return 'lunas';
            }

            return $paid > 0 ? 'dp_dibayar' : 'terpilih';
        }

        $active = array_diff($candidateStatuses, ['ditolak']);

        if ($active === []) {
            return 'belum_dicari';
        }

        if (in_array('negosiasi', $active, true)) {
            return 'negosiasi';
        }

        foreach ($upcomingMeetingDates as $date) {
            if ($date > $today->toDateString()) {
                return 'survei_terjadwal';
            }
        }

        if (in_array('survei', $active, true)) {
            return 'sudah_survei';
        }

        return in_array('shortlist', $active, true) ? 'shortlist' : 'riset';
    }
}
