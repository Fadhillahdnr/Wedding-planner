<?php

use App\Models\Memory;
use App\Models\VendorCandidate;
use App\Models\VendorMeeting;

/*
|--------------------------------------------------------------------------
| Media (Cloudinary)
|--------------------------------------------------------------------------
| Aset bersifat privat (`type=authenticated`). Folder dan public_id ditentukan server,
| tidak pernah oleh klien. Lihat docs/CLOUDINARY.md.
*/

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),

    'root_folder' => env('CLOUDINARY_ROOT_FOLDER', 'wedding-planner'),

    // Batas SESUDAH kompresi di browser (sama dengan batas paket gratis Cloudinary: gambar 10 MB, video 100 MB).
    'max_bytes' => (int) env('MEDIA_MAX_BYTES', 10 * 1024 * 1024),
    'video_max_bytes' => (int) env('MEDIA_VIDEO_MAX_BYTES', 100 * 1024 * 1024),
    'max_per_item' => (int) env('MEDIA_MAX_PER_ITEM', 20),

    // Berapa jam aset berstatus `pending` (belum dikonfirmasi) dipertahankan sebelum dibersihkan.
    'pending_ttl_hours' => 24,

    /*
     | Target unggahan: kunci dipakai klien, kelas model diselesaikan server (sehingga ikut
     | scope wedding_id → ID milik workspace lain = 404).
     */
    'targets' => [
        'vendor_meeting' => [
            'model' => VendorMeeting::class,
            'formats' => ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
        ],
        'memory' => [
            'model' => Memory::class,
            'formats' => ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
            // Hanya target yang punya `video_formats` yang menerima video.
            'video_formats' => ['mp4', 'mov', 'webm'],
        ],
        'vendor_candidate' => [
            'model' => VendorCandidate::class,
            'formats' => ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'pdf'],
        ],
    ],
];
