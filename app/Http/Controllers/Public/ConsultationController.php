<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConsultationRequest;
use App\Models\ConsultationLead;
use Inertia\Inertia;

class ConsultationController extends Controller
{
    public function create()
    {
        return Inertia::render('public/consultation');
    }

    public function store(ConsultationRequest $request)
    {
        ConsultationLead::create([
            ...$request->safe()->except('website'),
            'user_id' => $request->user()?->id,
        ]);

        return back()->with('success', 'Terima kasih! Tim kami akan menghubungi Anda dalam 1×24 jam kerja.');
    }
}
