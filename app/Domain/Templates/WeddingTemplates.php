<?php

namespace App\Domain\Templates;

/**
 * Template umum sebagai titik awal. Isinya sengaja tidak memuat aturan hukum/administrasi,
 * biaya, atau harga pasar sebagai fakta: untuk administrasi hanya ada tugas "cari tahu & verifikasi".
 */
final class WeddingTemplates
{
    public const LABEL = 'Template umum — sesuaikan dengan adat, agama, dan keluarga Anda.';

    public const PHASES = [
        1 => 'Fondasi',
        2 => 'Konsep & riset',
        3 => 'Kunci yang langka',
        4 => 'Vendor utama',
        5 => 'Detail',
        6 => 'Administrasi',
        7 => 'Finalisasi',
        8 => 'Minggu terakhir',
        9 => 'Hari H & sesudahnya',
    ];

    /** @var list<array{name:string,category:string,need:string,months:?int,per_guest:bool}> */
    public const VENDOR_SLOTS = [
        ['name' => 'Venue / gedung', 'category' => 'Venue & katering', 'need' => 'needed', 'months' => 16, 'per_guest' => false],
        ['name' => 'Katering', 'category' => 'Venue & katering', 'need' => 'needed', 'months' => 14, 'per_guest' => true],
        ['name' => 'Dekorasi & florist', 'category' => 'Dekorasi', 'need' => 'needed', 'months' => 10, 'per_guest' => false],
        ['name' => 'Dokumentasi (foto & video)', 'category' => 'Dokumentasi', 'need' => 'needed', 'months' => 14, 'per_guest' => false],
        ['name' => 'Rias (MUA)', 'category' => 'Rias & busana', 'need' => 'needed', 'months' => 10, 'per_guest' => false],
        ['name' => 'Busana pengantin', 'category' => 'Rias & busana', 'need' => 'needed', 'months' => 9, 'per_guest' => false],
        ['name' => 'Wedding organizer / day-of coordinator', 'category' => 'Administrasi', 'need' => 'optional', 'months' => 16, 'per_guest' => false],
        ['name' => 'MC', 'category' => 'Hiburan & MC', 'need' => 'optional', 'months' => 10, 'per_guest' => false],
        ['name' => 'Hiburan & musik', 'category' => 'Hiburan & MC', 'need' => 'optional', 'months' => 9, 'per_guest' => false],
        ['name' => 'Sound & lighting', 'category' => 'Hiburan & MC', 'need' => 'optional', 'months' => 8, 'per_guest' => false],
        ['name' => 'Undangan & cetak', 'category' => 'Undangan & souvenir', 'need' => 'needed', 'months' => 6, 'per_guest' => true],
        ['name' => 'Souvenir', 'category' => 'Undangan & souvenir', 'need' => 'optional', 'months' => 6, 'per_guest' => true],
        ['name' => 'Cincin', 'category' => 'Seserahan, mahar & cincin', 'need' => 'needed', 'months' => 6, 'per_guest' => false],
        ['name' => 'Seserahan & mahar', 'category' => 'Seserahan, mahar & cincin', 'need' => 'optional', 'months' => 5, 'per_guest' => false],
        ['name' => 'Transportasi', 'category' => 'Transport & akomodasi', 'need' => 'optional', 'months' => 5, 'per_guest' => false],
        ['name' => 'Akomodasi keluarga & tamu luar kota', 'category' => 'Transport & akomodasi', 'need' => 'optional', 'months' => 6, 'per_guest' => false],
        ['name' => 'Kue pernikahan', 'category' => 'Hiburan & MC', 'need' => 'optional', 'months' => 4, 'per_guest' => false],
        ['name' => 'Photobooth', 'category' => 'Hiburan & MC', 'need' => 'optional', 'months' => 4, 'per_guest' => false],
        ['name' => 'Pre-wedding', 'category' => 'Pre-wedding', 'need' => 'optional', 'months' => 9, 'per_guest' => false],
        ['name' => 'Honeymoon', 'category' => 'Honeymoon', 'need' => 'optional', 'months' => 6, 'per_guest' => false],
    ];

    /** @var list<string> */
    public const SCORE_CRITERIA = ['Harga', 'Kualitas', 'Komunikasi', 'Kecocokan gaya'];

    /**
     * Offset: positif = sebelum hari H, negatif = sesudahnya.
     *
     * @return list<array{phase:int,title:string,value:int,unit:string,slot?:string}>
     */
    public static function tasks(): array
    {
        return [
            ['phase' => 1, 'title' => 'Diskusikan visi pernikahan dan restu kedua keluarga', 'value' => 24, 'unit' => 'months'],
            ['phase' => 1, 'title' => 'Tetapkan perkiraan jumlah tamu', 'value' => 23, 'unit' => 'months'],
            ['phase' => 1, 'title' => 'Tetapkan total anggaran dan sumber dananya', 'value' => 23, 'unit' => 'months'],
            ['phase' => 1, 'title' => 'Buka rekening atau pos tabungan khusus pernikahan', 'value' => 22, 'unit' => 'months'],
            ['phase' => 1, 'title' => 'Sepakati pembagian peran dua keluarga', 'value' => 21, 'unit' => 'months'],
            ['phase' => 2, 'title' => 'Tentukan gaya acara dan hal yang paling diprioritaskan', 'value' => 21, 'unit' => 'months'],
            ['phase' => 2, 'title' => 'Riset calon venue', 'value' => 20, 'unit' => 'months', 'slot' => 'Venue / gedung'],
            ['phase' => 2, 'title' => 'Kunjungi wedding fair', 'value' => 19, 'unit' => 'months'],
            ['phase' => 2, 'title' => 'Tinjau daftar vendor yang dibutuhkan', 'value' => 18, 'unit' => 'months'],
            ['phase' => 3, 'title' => 'Survei dan pilih venue', 'value' => 16, 'unit' => 'months', 'slot' => 'Venue / gedung'],
            ['phase' => 3, 'title' => 'Tentukan tanggal final', 'value' => 15, 'unit' => 'months'],
            ['phase' => 3, 'title' => 'Putuskan memakai WO atau koordinator hari H', 'value' => 15, 'unit' => 'months', 'slot' => 'Wedding organizer / day-of coordinator'],
            ['phase' => 3, 'title' => 'Pesan dokumentasi', 'value' => 14, 'unit' => 'months', 'slot' => 'Dokumentasi (foto & video)'],
            ['phase' => 3, 'title' => 'Pilih katering', 'value' => 14, 'unit' => 'months', 'slot' => 'Katering'],
            ['phase' => 4, 'title' => 'Pilih rias', 'value' => 10, 'unit' => 'months', 'slot' => 'Rias (MUA)'],
            ['phase' => 4, 'title' => 'Pilih busana pengantin', 'value' => 9, 'unit' => 'months', 'slot' => 'Busana pengantin'],
            ['phase' => 4, 'title' => 'Pilih dekorasi', 'value' => 10, 'unit' => 'months', 'slot' => 'Dekorasi & florist'],
            ['phase' => 4, 'title' => 'Pilih MC dan hiburan', 'value' => 9, 'unit' => 'months', 'slot' => 'MC'],
            ['phase' => 4, 'title' => 'Jadwalkan pre-wedding', 'value' => 9, 'unit' => 'months', 'slot' => 'Pre-wedding'],
            ['phase' => 4, 'title' => 'Mulai menyusun daftar tamu awal', 'value' => 9, 'unit' => 'months'],
            ['phase' => 5, 'title' => 'Desain undangan', 'value' => 7, 'unit' => 'months', 'slot' => 'Undangan & cetak'],
            ['phase' => 5, 'title' => 'Tentukan souvenir', 'value' => 7, 'unit' => 'months', 'slot' => 'Souvenir'],
            ['phase' => 5, 'title' => 'Susun daftar seserahan', 'value' => 6, 'unit' => 'months', 'slot' => 'Seserahan & mahar'],
            ['phase' => 5, 'title' => 'Pilih cincin', 'value' => 6, 'unit' => 'months', 'slot' => 'Cincin'],
            ['phase' => 5, 'title' => 'Rencanakan akomodasi dan transportasi', 'value' => 6, 'unit' => 'months', 'slot' => 'Akomodasi keluarga & tamu luar kota'],
            ['phase' => 6, 'title' => 'Cari tahu dan verifikasi persyaratan resmi pernikahan di KUA, catatan sipil, atau lembaga terkait', 'value' => 6, 'unit' => 'months'],
            ['phase' => 6, 'title' => 'Lengkapi berkas persyaratan resmi sesuai hasil verifikasi', 'value' => 4, 'unit' => 'months'],
            ['phase' => 6, 'title' => 'Ikuti bimbingan pranikah bila relevan dengan agama atau adat Anda', 'value' => 4, 'unit' => 'months'],
            ['phase' => 6, 'title' => 'Periksa kesehatan', 'value' => 3, 'unit' => 'months'],
            ['phase' => 6, 'title' => 'Fitting busana pertama', 'value' => 3, 'unit' => 'months', 'slot' => 'Busana pengantin'],
            ['phase' => 7, 'title' => 'Cetak dan sebarkan undangan', 'value' => 2, 'unit' => 'months', 'slot' => 'Undangan & cetak'],
            ['phase' => 7, 'title' => 'Konfirmasi kehadiran tamu', 'value' => 1, 'unit' => 'months'],
            ['phase' => 7, 'title' => 'Tasting katering', 'value' => 2, 'unit' => 'months', 'slot' => 'Katering'],
            ['phase' => 7, 'title' => 'Susun rundown acara', 'value' => 1, 'unit' => 'months'],
            ['phase' => 7, 'title' => 'Fitting busana terakhir', 'value' => 1, 'unit' => 'months', 'slot' => 'Busana pengantin'],
            ['phase' => 7, 'title' => 'Konfirmasi ulang semua vendor', 'value' => 1, 'unit' => 'months'],
            ['phase' => 8, 'title' => 'Lunasi pembayaran vendor yang jatuh tempo', 'value' => 3, 'unit' => 'weeks'],
            ['phase' => 8, 'title' => 'Gladi resik', 'value' => 1, 'unit' => 'weeks'],
            ['phase' => 8, 'title' => 'Siapkan amplop dan pembayaran sisa', 'value' => 1, 'unit' => 'weeks'],
            ['phase' => 8, 'title' => 'Briefing keluarga dan panitia', 'value' => 3, 'unit' => 'days'],
            ['phase' => 8, 'title' => 'Kemas semua kebutuhan hari H', 'value' => 1, 'unit' => 'days'],
            ['phase' => 9, 'title' => 'Delegasikan tugas hari H', 'value' => 0, 'unit' => 'days'],
            ['phase' => 9, 'title' => 'Bayar sisa vendor dan kirim ucapan terima kasih', 'value' => -1, 'unit' => 'weeks'],
            ['phase' => 9, 'title' => 'Arsipkan dokumen dan foto', 'value' => -2, 'unit' => 'weeks'],
            ['phase' => 9, 'title' => 'Evaluasi anggaran akhir', 'value' => -1, 'unit' => 'months'],
        ];
    }
}
