<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Memastikan pengguna tergabung di sebuah workspace; yang belum onboarding diarahkan ke wizard. */
class EnsureWorkspace
{
    public function handle(Request $request, Closure $next, string $mode = 'onboarded'): Response
    {
        $wedding = $request->user()?->wedding();

        abort_if($wedding === null, 403, 'Akun ini belum tergabung di workspace pernikahan.');

        if ($mode === 'onboarded' && ! $wedding->isOnboarded()) {
            return redirect()->route('onboarding');
        }

        $request->attributes->set('wedding', $wedding);

        return $next($request);
    }
}
