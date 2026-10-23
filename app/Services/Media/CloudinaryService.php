<?php

namespace App\Services\Media;

use App\Models\MediaAsset;
use Cloudinary\Api\ApiUtils;
use Cloudinary\Api\Exception\NotFound;
use Cloudinary\Cloudinary;

class CloudinaryService implements MediaStorage
{
    private ?Cloudinary $client = null;

    public function isConfigured(): bool
    {
        return filled(config('media.cloud_name')) && filled(config('media.api_key')) && filled(config('media.api_secret'));
    }

    public function signUpload(string $publicId, array $formats, string $resourceType = 'image'): array
    {
        $params = [
            'allowed_formats' => implode(',', $formats),
            'public_id' => $publicId,
            'timestamp' => time(),
            'type' => 'authenticated',
        ];

        $signature = ApiUtils::signParameters($params, config('media.api_secret'));

        return [
            'url' => 'https://api.cloudinary.com/v1_1/'.config('media.cloud_name').'/'.$resourceType.'/upload',
            'fields' => $params + ['api_key' => config('media.api_key'), 'signature' => $signature],
        ];
    }

    public function inspect(string $publicId, string $resourceType = 'image'): ?array
    {
        try {
            $asset = $this->client()->adminApi()->asset($publicId, ['type' => 'authenticated', 'resource_type' => $resourceType]);
        } catch (NotFound) {
            return null;
        }

        return [
            'format' => $asset['format'] ?? null,
            'bytes' => (int) ($asset['bytes'] ?? 0),
            'width' => $asset['width'] ?? null,
            'height' => $asset['height'] ?? null,
        ];
    }

    public function delete(string $publicId, string $resourceType = 'image'): bool
    {
        $result = $this->client()->uploadApi()->destroy($publicId, ['type' => 'authenticated', 'resource_type' => $resourceType, 'invalidate' => true]);

        return in_array($result['result'] ?? null, ['ok', 'not found'], true);
    }

    public function url(MediaAsset $asset): string
    {
        if ($asset->resource_type === 'video') {
            // Sumber .mov/.webm dikirim sebagai MP4 (H.264) supaya Chrome/Firefox/Safari bisa memutarnya.
            $video = $this->client()->video($asset->public_id)->deliveryType('authenticated')->signUrl(true)->extension('mp4');

            return (string) $video->toUrl();
        }

        $image = $this->client()->image($asset->public_id)->deliveryType('authenticated')->signUrl(true);

        if ($asset->format) {
            // HEIC/HEIF tidak bisa ditampilkan browser selain Safari, jadi dikirim sebagai JPEG.
            $image->extension(in_array($asset->format, ['heic', 'heif'], true) ? 'jpg' : $asset->format);
        }

        return (string) $image->toUrl();
    }

    public function posterUrl(MediaAsset $asset): string
    {
        $poster = $this->client()->video($asset->public_id)->deliveryType('authenticated')->signUrl(true)
            ->addTransformation('so_0,w_960,c_limit')
            ->extension('jpg');

        return (string) $poster->toUrl();
    }

    private function client(): Cloudinary
    {
        return $this->client ??= new Cloudinary([
            'cloud' => [
                'cloud_name' => config('media.cloud_name'),
                'api_key' => config('media.api_key'),
                'api_secret' => config('media.api_secret'),
            ],
            'url' => ['secure' => true],
        ]);
    }
}
