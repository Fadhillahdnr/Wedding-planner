<?php

namespace App\Services\Cloudinary;

use Cloudinary\Api\Utils\ApiUtils;
use Cloudinary\Cloudinary;

class SdkCloudinaryGateway implements CloudinaryGateway
{
    private ?Cloudinary $client = null;

    private function client(): Cloudinary
    {
        return $this->client ??= new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'url' => ['secure' => true],
        ]);
    }

    public function destroy(string $publicId, string $resourceType, bool $private = false): bool
    {
        $result = $this->client()->uploadApi()->destroy($publicId, [
            'resource_type' => $resourceType,
            'type' => $private ? 'authenticated' : 'upload',
            'invalidate' => true,
        ]);

        return in_array($result['result'] ?? null, ['ok', 'not found'], true);
    }

    public function sign(array $params): string
    {
        return ApiUtils::signParameters($params, (string) config('cloudinary.api_secret'));
    }

    public function signedUrl(string $publicId, string $resourceType, ?string $format): string
    {
        $asset = $resourceType === 'image'
            ? $this->client()->image($publicId)
            : $this->client()->video($publicId);

        return (string) $asset->deliveryType('authenticated')->signUrl(true)->toUrl();
    }
}
