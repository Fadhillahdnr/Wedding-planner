<?php

namespace Tests\Support;

use App\Models\MediaAsset;
use App\Services\Media\MediaStorage;

/** Pengganti Cloudinary untuk test: "unggahan" disimulasikan lewat $remote. */
class FakeMediaStorage implements MediaStorage
{
    /** @var array<string,array{format:?string,bytes:int,width:?int,height:?int}> */
    public array $remote = [];

    /** @var list<string> */
    public array $deleted = [];

    public bool $configured = true;

    public bool $failDelete = false;

    public function isConfigured(): bool
    {
        return $this->configured;
    }

    public function signUpload(string $publicId, array $formats): array
    {
        return ['url' => 'https://upload.test', 'fields' => ['public_id' => $publicId, 'type' => 'authenticated', 'allowed_formats' => implode(',', $formats), 'signature' => 'sig']];
    }

    public function inspect(string $publicId): ?array
    {
        return $this->remote[$publicId] ?? null;
    }

    public function delete(string $publicId): bool
    {
        if ($this->failDelete) {
            return false;
        }

        $this->deleted[] = $publicId;
        unset($this->remote[$publicId]);

        return true;
    }

    public function url(MediaAsset $asset): string
    {
        return 'https://res.test/'.$asset->public_id.'?sig=1';
    }

    public function upload(string $publicId, string $format = 'jpg', int $bytes = 1000): void
    {
        $this->remote[$publicId] = ['format' => $format, 'bytes' => $bytes, 'width' => 800, 'height' => 600];
    }
}
