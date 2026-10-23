<?php

namespace App\Http\Controllers;

use App\Domain\Templates\TemplateApplier;
use App\Domain\Templates\WeddingTemplates;
use App\Http\Requests\OnboardingRequest;
use App\Models\FundingSource;
use App\Services\ActivityLogger;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function show()
    {
        $wedding = request()->user()->wedding();

        return Inertia::render('onboarding', [
            'wedding' => [
                'partner_one_name' => $wedding->partner_one_name,
                'partner_two_name' => $wedding->partner_two_name,
                'city' => $wedding->city,
                'guest_estimate' => $wedding->guest_estimate,
                'total_budget' => $wedding->total_budget,
                'tradition' => $wedding->tradition,
                'ceremonies' => $wedding->ceremonies ?? [],
            ],
            // Saran bulan perkiraan: sekitar 24 bulan dari sekarang, bisa diubah di wizard.
            'suggestedMonth' => now()->addMonthsNoOverflow(24)->format('Y-m'),
            'templateLabel' => WeddingTemplates::LABEL,
            'ceremonyOptions' => ['Akad / pemberkatan', 'Resepsi', 'Ngunduh mantu', 'Siraman', 'Lamaran'],
        ]);
    }

    public function store(OnboardingRequest $request, TemplateApplier $templates, ActivityLogger $log)
    {
        $data = $request->validated();
        $wedding = $request->user()->wedding();

        DB::transaction(function () use ($data, $wedding, $templates, $log) {
            $wedding->update([
                'partner_one_name' => $data['partner_one_name'] ?? null,
                'partner_two_name' => $data['partner_two_name'] ?? null,
                'target_date' => $data['target_date'] ?? null,
                'target_month' => isset($data['target_month']) ? Carbon::createFromFormat('Y-m', $data['target_month'])->startOfMonth() : null,
                'city' => $data['city'] ?? null,
                'guest_estimate' => $data['guest_estimate'] ?? null,
                'total_budget' => $data['total_budget'] ?? null,
                'tradition' => $data['tradition'] ?? null,
                'ceremonies' => $data['ceremonies'] ?? [],
                'include_honeymoon' => $data['include_honeymoon'] ?? false,
                'include_prewedding' => $data['include_prewedding'] ?? false,
                'onboarded_at' => now(),
            ]);

            if (filled($data['funding_name'] ?? null)) {
                FundingSource::create([
                    'name' => $data['funding_name'],
                    'collected_amount' => $data['funding_collected'] ?? 0,
                    'monthly_contribution' => $data['funding_monthly'] ?? 0,
                ]);
            }

            $templates->apply($wedding);
            $log->record('onboarding.completed');
        });

        return to_route('dashboard')->with('success', 'Selamat datang. Template umum sudah disiapkan — sesuaikan sesukamu.');
    }
}
