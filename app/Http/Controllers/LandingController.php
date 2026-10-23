<?php

namespace App\Http\Controllers;

use App\Domain\Templates\WeddingTemplates;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Halaman depan publik: hanya informasi umum, tanpa data pasangan mana pun. */
class LandingController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->user()) {
            return redirect()->route('dashboard');
        }

        // Nama fase adalah template umum, bukan data pasangan mana pun.
        return Inertia::render('landing', ['phases' => array_values(WeddingTemplates::PHASES)]);
    }
}
