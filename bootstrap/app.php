<?php

use App\Http\Middleware\EnsureWorkspace;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Di belakang proxy/tunnel (mis. Cloudflare) agar URL & cookie memakai HTTPS yang benar.
        if ($proxies = env('TRUSTED_PROXIES')) {
            $middleware->trustProxies(at: $proxies === '*' ? '*' : explode(',', $proxies));
        }

        $middleware->alias(['workspace' => EnsureWorkspace::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Halaman error bermerek; 500/503 tetap memakai halaman debug Laravel saat APP_DEBUG menyala.
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            $status = $response->getStatusCode();
            $branded = [403, 404, 419, 429];
            $serverSide = [500, 503];

            if (in_array($status, $branded, true) || (in_array($status, $serverSide, true) && ! app()->hasDebugModeEnabled())) {
                return Inertia::render('error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
