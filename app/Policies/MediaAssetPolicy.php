<?php

namespace App\Policies;

use App\Models\MediaAsset;
use App\Models\User;

class MediaAssetPolicy
{
    public function view(User $user, MediaAsset $asset): bool
    {
        return ! $asset->isPrivate() || $user->isStaff() || $asset->uploaded_by === $user->id;
    }

    public function delete(User $user, MediaAsset $asset): bool
    {
        return $user->isStaff() || $asset->uploaded_by === $user->id;
    }
}
