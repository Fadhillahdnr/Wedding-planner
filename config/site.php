<?php

// Identitas brand & kontak. Semua dapat diganti lewat .env — belum ada data bisnis final.
return [
    'name' => env('SITE_NAME', 'Lumière Wedding'),
    'tagline' => env('SITE_TAGLINE', 'Perencana pernikahan yang tenang, personal, dan terukur.'),
    'email' => env('SITE_EMAIL', 'halo@example.com'),
    'phone' => env('SITE_PHONE', '+62 000 0000 0000'),
    'whatsapp' => env('SITE_WHATSAPP'),
    'instagram' => env('SITE_INSTAGRAM'),
    'address' => env('SITE_ADDRESS', 'Alamat belum dikonfigurasi'),
];
