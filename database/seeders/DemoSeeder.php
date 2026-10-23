<?php

namespace Database\Seeders;

use App\Domain\Templates\TemplateApplier;
use App\Enums\MemberRole;
use App\Models\BudgetItem;
use App\Models\FundingSource;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Models\VendorCandidate;
use App\Models\VendorSlot;
use App\Models\Wedding;
use App\Models\WeddingMember;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * DATA CONTOH untuk pengembangan lokal dan screenshot. Semua nama dan angka fiktif dan berlabel "Contoh";
 * tidak pernah dijalankan di production dan bukan bagian dari DatabaseSeeder.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('DemoSeeder tidak boleh dijalankan di production.');
        }

        $wedding = Wedding::create([
            'partner_one_name' => 'Alya (contoh)',
            'partner_two_name' => 'Bima (contoh)',
            'target_month' => now()->addMonths(22)->startOfMonth(),
            'city' => 'Bandung',
            'guest_estimate' => 250,
            'total_budget' => 250_000_000,
            'tradition' => 'Sunda',
            'ceremonies' => ['Akad / pemberkatan', 'Resepsi'],
            'onboarded_at' => now(),
        ]);

        $owner = User::factory()->create(['name' => 'Alya (contoh)', 'email' => 'alya@contoh.test', 'password' => 'contoh-kata-sandi']);
        WeddingMember::create(['wedding_id' => $wedding->id, 'user_id' => $owner->id, 'role' => MemberRole::Owner]);

        $partner = User::factory()->create(['name' => 'Bima (contoh)', 'email' => 'bima@contoh.test', 'password' => 'contoh-kata-sandi']);
        WeddingMember::create(['wedding_id' => $wedding->id, 'user_id' => $partner->id, 'role' => MemberRole::Partner]);

        app(TemplateApplier::class)->apply($wedding);
        $this->actingAs($owner);

        FundingSource::create(['name' => 'Tabungan bersama (contoh)', 'collected_amount' => 45_000_000, 'monthly_contribution' => 6_000_000]);
        FundingSource::create(['name' => 'Bantuan keluarga (contoh)', 'collected_amount' => 30_000_000, 'target_amount' => 60_000_000, 'monthly_contribution' => 1_500_000]);

        $this->price('Venue / gedung', 35_000_000, 55_000_000);
        $this->price('Dekorasi & florist', 20_000_000, 35_000_000);
        $this->price('Dokumentasi (foto & video)', 12_000_000, 22_000_000);
        $this->price('Rias (MUA)', 6_000_000, 10_000_000);
        $this->price('Busana pengantin', 10_000_000, 18_000_000, 14_500_000);
        BudgetItem::where('name', 'Katering')->update(['price_per_guest' => 175_000]);
        BudgetItem::where('name', 'Undangan & cetak')->update(['price_per_guest' => 12_000]);

        $venue = VendorSlot::where('name', 'Venue / gedung')->first();
        $this->candidate($venue, 'Gedung Contoh Asri', 48_000_000, 'negosiasi', ['Harga', 4, 'Kualitas', 5]);
        $chosen = $this->candidate($venue, 'Balai Contoh Mawar', 42_000_000, 'terpilih');
        $venue->budgetItem->update(['agreed_amount' => 42_000_000]);
        Payment::create(['budget_item_id' => $venue->budget_item_id, 'label' => 'DP (contoh)', 'amount' => 12_000_000, 'status' => 'lunas', 'paid_on' => now()->subDays(20)]);
        Payment::create(['budget_item_id' => $venue->budget_item_id, 'label' => 'Termin 2 (contoh)', 'amount' => 15_000_000, 'status' => 'direncanakan', 'due_date' => now()->addDays(18)]);
        Payment::create(['budget_item_id' => $venue->budget_item_id, 'label' => 'Pelunasan (contoh)', 'amount' => 15_000_000, 'status' => 'direncanakan', 'due_date' => now()->addMonths(20)]);
        $chosen->meetings()->create(['met_on' => now()->subDays(25), 'notes' => 'Contoh: ruangan muat 300 tamu, parkir luas.', 'follow_up' => 'Tanyakan biaya listrik tambahan']);

        $photo = VendorSlot::where('name', 'Dokumentasi (foto & video)')->first();
        $this->candidate($photo, 'Studio Contoh Satu', 14_000_000, 'survei', ['Harga', 4, 'Kualitas', 4]);
        $this->candidate($photo, 'Studio Contoh Dua', 19_500_000, 'shortlist', ['Harga', 2, 'Kualitas', 5]);
        $this->candidate($photo, 'Studio Contoh Tiga', 11_000_000, 'dihubungi');

        Task::whereIn('phase', [1])->update(['status' => 'selesai', 'completed_at' => now()]);
        Task::where('title', 'Tentukan gaya acara dan hal yang paling diprioritaskan')->update(['status' => 'dikerjakan']);
        Task::where('title', 'Riset calon venue')->update(['due_date' => now()->subDays(6)]);
    }

    private function actingAs(User $user): void
    {
        auth()->setUser($user);
    }

    private function price(string $name, int $min, int $max, ?int $agreed = null): void
    {
        BudgetItem::where('name', $name)->update(['estimate_min' => $min, 'estimate_max' => $max, 'agreed_amount' => $agreed]);
    }

    /** @param  list<string|int>  $scores  pasangan nama kriteria dan skor */
    private function candidate(VendorSlot $slot, string $name, int $price, string $status, array $scores = []): VendorCandidate
    {
        $candidate = VendorCandidate::create([
            'vendor_slot_id' => $slot->id,
            'name' => $name,
            'quoted_price' => $price,
            'status' => $status,
            'city' => 'Bandung',
            'package_name' => 'Paket contoh',
            'inclusions' => 'Contoh: tim 3 orang, album, file digital',
            'exclusions' => 'Contoh: transport luar kota',
            'pros' => 'Contoh: komunikasi cepat',
            'cons' => 'Contoh: jadwal terbatas',
            'source' => 'Contoh: wedding fair',
        ]);

        foreach (array_chunk($scores, 2) as [$criterion, $score]) {
            $id = \App\Models\ScoreCriterion::where('name', $criterion)->value('id');
            $candidate->scores()->create(['score_criterion_id' => $id, 'score' => $score]);
        }

        return $candidate;
    }
}
