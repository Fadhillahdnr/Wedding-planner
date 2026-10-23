# Arsitektur
Modular monolith Laravel; halaman dirender via Inertia (tanpa API terpisah).
- `app/Http/Controllers/{Public,Customer,Admin}` — controller tipis per area; `MediaController` untuk Cloudinary.
- `app/Services` — `BookingService` (transaksi, cek konflik, transisi), `BudgetCalculator` (hitung dalam sen), `Cloudinary/CloudinaryService` (satu-satunya titik akses Cloudinary; `CloudinaryGateway` diganti fake pada test).
- `app/Enums` — `Role`, `BookingStatus` (aturan transisi), `LeadStatus`.
- Otorisasi: middleware `EnsureStaff` untuk `/admin`, `MediaAssetPolicy`, pengecekan kepemilikan pada controller pelanggan. `role` tidak mass-assignable.
- Frontend: `resources/js/pages` (public, customer, admin), `components/site` (layout, SEO, field, reveal). Token desain di `resources/css/app.css` (ivory/champagne/sage, serif Cormorant Garamond + sans Manrope).
Keputusan: media memakai tabel `media_assets` polymorphic nullable agar sederhana; booking konflik = booking aktif yang sama (user + paket/vendor + tanggal).
