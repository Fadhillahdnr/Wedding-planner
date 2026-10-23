<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Menyajikan video landing dengan dukungan HTTP Range. Tanpa Range, browser tidak bisa
 * melakukan seek (scrub) pada video; server bawaan `php -S` mengabaikan header itu.
 */
class LandingVideoController extends Controller
{
    private const FILES = ['our-little-world.mp4', 'our-little-world-scrub.mp4'];

    public function __invoke(string $name): BinaryFileResponse
    {
        abort_unless(in_array($name, self::FILES, true), 404);

        return response()->file(public_path("videos/{$name}"), [
            'Content-Type' => 'video/mp4',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
