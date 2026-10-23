<?php

namespace App\Providers;

use App\Services\Media\CloudinaryService;
use App\Services\Media\MediaStorage;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(MediaStorage::class, CloudinaryService::class);
    }

    public function boot(): void
    {
        // Menangkap N+1 sejak pengembangan; di production tidak melempar error.
        Model::preventLazyLoading(! $this->app->isProduction());

        RateLimiter::for('media-signature', fn (Request $r) => Limit::perMinute(30)->by($r->user()?->id ?: $r->ip()));
    }
}
