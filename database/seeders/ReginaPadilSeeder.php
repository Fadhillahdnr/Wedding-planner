<?php

namespace Database\Seeders;

use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\FundingSource;
use App\Models\Task;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Memasukkan "Our Wedding Plan Regina & Padil" (PDF pribadi) ke workspace milik pengguna.
 * Jalankan: PLAN_OWNER_EMAIL=... php artisan db:seed --class=ReginaPadilSeeder
 * Idempotent: yang sudah ada (berdasarkan nama) dilewati. Semua angka estimasi dari dokumen.
 */
class ReginaPadilSeeder extends Seeder
{
    private const GUESTS = 75;

    /** @var array<string,array{allocated:int,items:list<array{0:string,1:int,2?:string}>}> */
    private const BUDGET = [
        'Mahar' => ['allocated' => 15_000_000, 'items' => [
            ['Uang tunai', 2_800_000],
            ['Emas Antam', 8_200_000, 'Alokasi mengikuti harga saat pembelian; belum memastikan jumlah gram.'],
            ['Cincin nikah berdua', 4_000_000],
        ]],
        'Seserahan' => ['allocated' => 15_000_000, 'items' => [
            ['Baju, gamis & outfit', 2_000_000], ['Tas', 1_500_000], ['Sepatu & sandal', 800_000],
            ['Skincare, bodycare & haircare', 1_000_000], ['Makeup', 1_200_000], ['Parfum', 800_000],
            ['Hijab & aksesori', 700_000], ['Piyama & pakaian dalam', 700_000],
            ['Mukena & perlengkapan ibadah', 500_000], ['Dompet & aksesori kecil', 300_000],
            ['Rice cooker', 350_000], ['Kompor 2 tungku', 350_000], ['Regulator, selang & gas awal', 300_000],
            ['Dispenser', 700_000], ['Peralatan masak', 800_000], ['Piring, mangkuk, gelas & sendok', 400_000],
            ['Blender', 350_000], ['Ketel listrik', 250_000], ['Sprei & sarung bantal', 350_000],
            ['Selimut & bantal tambahan', 350_000], ['Setrika', 250_000], ['Kipas angin', 350_000],
            ['Perlengkapan bersih-bersih', 300_000], ['Box & dekor seserahan', 300_000],
        ]],
        'Lamaran' => ['allocated' => 5_000_000, 'items' => [
            ['Makan keluarga', 2_000_000], ['Hantaran kue & buah', 500_000], ['Dekorasi sederhana', 500_000],
            ['Transportasi & kebutuhan perjalanan', 500_000], ['Outfit & kebutuhan kecil', 500_000],
            ['Dana cadangan lamaran', 1_000_000],
        ]],
        'Pengajian' => ['allocated' => 5_000_000, 'items' => [
            ['Konsumsi pengajian', 2_000_000], ['Ustaz/ustazah', 500_000], ['Perlengkapan pengajian', 500_000],
            ['Tempat & kebersihan', 500_000], ['Kebutuhan tambahan pengajian', 500_000],
            ['Dana cadangan pengajian', 1_000_000],
        ]],
        'Acara & dokumentasi' => ['allocated' => 16_000_000, 'items' => [
            ['Makan bersama (King Raos Sukabumi)', 5_250_000, 'per_guest'],
            ['Sewa baju CPW & CPP', 1_000_000], ['Fotografer', 2_000_000], ['WCC', 600_000],
            ['MC lamaran & nikahan', 1_000_000, 'Rp500.000 MC lamaran + Rp500.000 MC nikahan; pastikan paket dan durasi.'],
            ['Seragam keluarga', 1_000_000], ['Souvenir', 500_000], ['Snack anak-anak', 150_000],
            ['Transportasi sewa', 0], ['Biaya kecil & administrasi', 1_000_000], ['Dana cadangan acara', 3_500_000],
        ]],
        'Dana hidup & darurat' => ['allocated' => 44_000_000, 'items' => [
            ['Dana hidup setelah menikah', 40_900_000, 'Tempat tinggal, makan, listrik, air, internet, transportasi, kebutuhan rumah tangga, pegangan awal.'],
            ['Dana darurat tambahan', 3_100_000, 'Dipisahkan dari uang acara supaya tetap aman setelah menikah.'],
        ]],
    ];

    /** @var list<array{0:string,1:string,2:int,3:int}> nama, tenggat (akhir periode), target total, per bulan */
    private const FUNDING = [
        ['Bagian Regina', 'Pengajian, fotografer, WCC, souvenir, snack anak-anak', 8_250_000, 359_000],
        ['Bagian Padil', 'Mahar, seserahan, lamaran, makan bersama, baju, MC, seragam, administrasi, cadangan, dana setelah menikah', 91_750_000, 3_989_000],
    ];

    /** @var array<string,list<string>> tenggat => tugas */
    private const COUNTDOWN = [
        '2026-12-31' => ['Rapikan keuangan dan cicilan', 'Tentukan target tabungan'],
        '2027-12-31' => ['Nabung rutin', 'Riset cincin, emas, seserahan, fotografer, dan WCC'],
        '2028-06-30' => ['Pastikan tempat tinggal', 'Konfirmasi KUA dan paket restoran', 'Cek ulang jumlah tamu dan budget'],
        '2028-08-31' => ['Urus dokumen nikah', 'Booking baju, fotografer, WCC, dan MC', 'Pesan souvenir dan seragam'],
        '2028-09-27' => ['Konfirmasi kebutuhan hari H', 'Siapkan mahar dan perlengkapan', 'Simpan dana darurat'],
        '2028-09-28' => ['Enjoy our special day!'],
    ];

    public function run(): void
    {
        $email = env('PLAN_OWNER_EMAIL') ?: throw new RuntimeException('Set PLAN_OWNER_EMAIL.');
        $user = User::where('email', $email)->firstOrFail();
        $wedding = Wedding::findOrFail($user->weddingId() ?? throw new RuntimeException('Pengguna belum punya workspace.'));

        DB::transaction(function () use ($wedding) {
            $wedding->forceFill([
                'partner_one_name' => 'Padil',
                'partner_two_name' => 'Regina',
                'target_date' => '2028-09-28',
                'city' => 'Sukabumi',
                'guest_estimate' => self::GUESTS,
                'total_budget' => 100_000_000,
                'contingency_percent' => 0, // cadangan sudah ada sebagai pos tersendiri di dokumen
                'ceremonies' => ['Lamaran', 'Pengajian', 'Akad (KUA, rencana)', 'Makan bersama'],
                'onboarded_at' => $wedding->onboarded_at ?? now(),
            ])->save();

            $order = 0;
            foreach (self::BUDGET as $name => $def) {
                $category = $this->firstOrMake(BudgetCategory::class, $wedding, ['name' => $name], [
                    'allocated_amount' => $def['allocated'], 'sort_order' => $order++, 'source' => 'user',
                ]);

                foreach ($def['items'] as $i => $item) {
                    $perGuest = ($item[2] ?? null) === 'per_guest';
                    $this->firstOrMake(BudgetItem::class, $wedding, ['budget_category_id' => $category->id, 'name' => $item[0]], [
                        'pricing_mode' => $perGuest ? 'per_guest' : 'fixed',
                        'estimate_min' => $perGuest ? null : $item[1],
                        'estimate_max' => $perGuest ? null : $item[1],
                        'price_per_guest' => $perGuest ? intdiv($item[1], self::GUESTS) : null,
                        'notes' => $perGuest ? 'Menu King Raos: 75 orang × Rp70.000. Pastikan pajak, minuman, tambahan porsi, dan tempat sudah termasuk paket.' : ($item[2] ?? null),
                        'sort_order' => $i,
                        'source' => 'user',
                    ]);
                }
            }

            foreach (self::FUNDING as [$name, , $target, $monthly]) {
                $this->firstOrMake(FundingSource::class, $wedding, ['name' => $name], [
                    'target_amount' => $target, 'monthly_contribution' => $monthly,
                ]);
            }

            foreach (self::COUNTDOWN as $due => $titles) {
                foreach ($titles as $title) {
                    $this->firstOrMake(Task::class, $wedding, ['title' => $title], ['due_date' => $due, 'source' => 'user']);
                }
            }
        });
    }

    /**
     * @template T of Model
     *
     * @param  class-string<T>  $class
     * @param  array<string,mixed>  $keys
     * @param  array<string,mixed>  $values
     * @return T
     */
    private function firstOrMake(string $class, Wedding $wedding, array $keys, array $values): Model
    {
        $existing = $class::withoutGlobalScopes()->where('wedding_id', $wedding->id)->where($keys)->first();
        if ($existing) {
            return $existing;
        }

        $model = new $class;
        $model->forceFill($keys + $values + ['wedding_id' => $wedding->id])->save();

        return $model;
    }
}
