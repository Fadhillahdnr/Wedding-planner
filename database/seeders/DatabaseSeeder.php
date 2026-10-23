<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Faq;
use App\Models\Package;
use App\Models\PortfolioProject;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Seluruh data di sini adalah DATA DEMO — ganti sebelum produksi. */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['Admin Demo', 'admin@demo.test', Role::Admin], ['Staff Demo', 'staff@demo.test', Role::Staff], ['Pelanggan Demo', 'customer@demo.test', Role::Customer]] as [$n, $e, $r]) {
            User::firstOrCreate(['email' => $e], ['name' => $n, 'password' => 'password'])
                ->forceFill(['role' => $r, 'email_verified_at' => now()])->save();
        }

        $packages = [
            ['Intimate (Demo)', 'Pernikahan kecil yang hangat untuk lingkaran terdekat.', 25_000_000, false, ['Konsultasi konsep', 'Koordinasi hari-H', 'Rundown acara']],
            ['Signature (Demo)', 'Perencanaan menyeluruh dari konsep hingga resepsi.', 75_000_000, true, ['Perencanaan penuh', 'Kurasi vendor', 'Manajemen anggaran', 'Tim koordinator hari-H']],
            ['Destination (Demo)', 'Pernikahan di luar kota dengan logistik terkelola.', 150_000_000, true, ['Survei lokasi', 'Logistik tamu', 'Koordinasi vendor lokal', 'Tim lapangan']],
        ];
        foreach ($packages as $i => [$name, $tag, $price, $feat, $features]) {
            $p = Package::updateOrCreate(['slug' => Str::slug($name)], ['name' => $name, 'tagline' => $tag, 'description' => $tag, 'price_from' => $price, 'is_featured' => true, 'is_published' => true, 'sort_order' => $i]);
            $p->features()->delete();
            foreach ($features as $j => $f) {
                $p->features()->create(['label' => $f, 'sort_order' => $j]);
            }
        }

        foreach (['Venue', 'Katering', 'Dekorasi', 'Fotografer & Videografer', 'Rias (MUA)', 'Busana', 'Hiburan', 'Undangan'] as $i => $name) {
            $cat = VendorCategory::updateOrCreate(['slug' => Str::slug($name)], ['name' => $name, 'sort_order' => $i]);
            Vendor::updateOrCreate(['slug' => Str::slug("$name demo")], [
                'vendor_category_id' => $cat->id, 'name' => "$name (Demo)", 'description' => 'Profil vendor demo — ganti dengan data mitra sebenarnya.',
                'city' => ['Jakarta', 'Bandung', 'Yogyakarta'][$i % 3], 'price_min' => 5_000_000 + $i * 2_000_000, 'price_max' => 20_000_000 + $i * 5_000_000, 'status' => 'published',
            ]);
        }

        foreach ([['Resepsi Taman (Demo)', 'Outdoor'], ['Akad Intimate (Demo)', 'Intimate'], ['Ballroom Klasik (Demo)', 'Indoor']] as [$t, $c]) {
            PortfolioProject::updateOrCreate(['slug' => Str::slug($t)], ['title' => $t, 'category' => $c, 'summary' => 'Proyek demo tanpa foto.', 'location' => 'Lokasi demo', 'event_date' => now()->subMonths(3), 'is_published' => true]);
        }

        foreach ([
            ['Kapan sebaiknya mulai merencanakan?', 'Idealnya 9–12 bulan sebelum hari pernikahan, namun kami juga menangani jadwal lebih singkat.'],
            ['Apakah harga paket bisa disesuaikan?', 'Ya. Harga pada situs ini bersifat "mulai dari" dan akan dirinci setelah konsultasi.'],
            ['Bagaimana cara booking?', 'Kirim permintaan konsultasi atau login dan ajukan booking paket; tim kami akan mengonfirmasi.'],
        ] as $i => [$q, $a]) {
            Faq::updateOrCreate(['question' => $q], ['answer' => $a, 'sort_order' => $i]);
        }
    }
}
