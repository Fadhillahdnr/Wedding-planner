<?php

namespace App\Console\Commands;

use App\Models\MediaAsset;
use App\Services\Media\MediaStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class MediaCheck extends Command
{
    protected $signature = 'media:check';

    protected $description = 'Uji nyata ke Cloudinary: unggah PNG 1x1, periksa, buka dengan/tanpa tanda tangan, lalu hapus.';

    public function handle(MediaStorage $storage): int
    {
        if (! $storage->isConfigured()) {
            $this->error('CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET belum diisi.');

            return self::FAILURE;
        }

        $publicId = trim(config('media.root_folder'), '/').'/_selftest/'.bin2hex(random_bytes(6));
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $ok = true;

        $sign = $storage->signUpload($publicId, ['png']);
        $upload = Http::asMultipart()->attach('file', $png, 'px.png')->post($sign['url'], $sign['fields']);
        $ok = $this->step('unggah (bertanda tangan)', $upload->successful(), $upload->successful() ? '' : $upload->body()) && $ok;

        $info = $storage->inspect($publicId);
        $ok = $this->step('inspect via Admin API', $info !== null && $info['format'] === 'png', json_encode($info)) && $ok;

        $asset = new MediaAsset(['public_id' => $publicId, 'format' => 'png']);
        $url = $storage->url($asset);
        $ok = $this->step('URL bertanda tangan terbuka', Http::get($url)->successful()) && $ok;

        $unsigned = preg_replace('#/s--[^/]+--#', '', $url);
        $ok = $this->step('URL tanpa tanda tangan DITOLAK (aset privat)', Http::get($unsigned)->failed()) && $ok;

        $ok = $this->step('hapus', $storage->delete($publicId)) && $ok;
        $ok = $this->step('aset sudah hilang', $storage->inspect($publicId) === null) && $ok;

        return $ok ? self::SUCCESS : self::FAILURE;
    }

    private function step(string $label, bool $passed, string $detail = ''): bool
    {
        $passed ? $this->info("  ✓ {$label}") : $this->error("  ✗ {$label} {$detail}");

        return $passed;
    }
}
