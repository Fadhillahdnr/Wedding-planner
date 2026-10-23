<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Menangkap N+1 sejak pengembangan; di production tidak melempar error.
        Model::preventLazyLoading(! $this->app->isProduction());

        RateLimiter::for('media-signature', fn (Request $r) => Limit::perMinute(30)->by($r->user()?->id ?: $r->ip()));
    }
}
