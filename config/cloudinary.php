<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),

    'root_folder' => env('CLOUDINARY_ROOT_FOLDER', 'wedding-planner'),

    // Batas ukuran upload (bytes). Sesuaikan dengan batas paket Cloudinary Anda.
    'max_bytes' => [
        'image' => (int) env('CLOUDINARY_MAX_IMAGE_BYTES', 10 * 1024 * 1024),
        'video' => (int) env('CLOUDINARY_MAX_VIDEO_BYTES', 100 * 1024 * 1024),
        'audio' => (int) env('CLOUDINARY_MAX_AUDIO_BYTES', 20 * 1024 * 1024),
    ],

    // Format yang diizinkan per resource type (audio dikirim Cloudinary sebagai resource_type "video").
    'allowed_formats' => [
        'image' => ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        'video' => ['mp4', 'webm'],
        'audio' => ['mp3', 'ogg', 'wav'],
    ],
];
