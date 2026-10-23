<?php

namespace App\Providers;

use App\Models\MediaAsset;
use App\Policies\MediaAssetPolicy;
use App\Services\Cloudinary\CloudinaryGateway;
use App\Services\Cloudinary\SdkCloudinaryGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CloudinaryGateway::class, SdkCloudinaryGateway::class);
    }

    public function boot(): void
    {
        Gate::policy(MediaAsset::class, MediaAssetPolicy::class);
        Gate::define('manage-content', fn ($user) => $user->isStaff());
        Gate::define('manage-users', fn ($user) => $user->isAdmin());

        RateLimiter::for('consultation', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));
    }
}
