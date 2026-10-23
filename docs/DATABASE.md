# Database (PostgreSQL)

Tabel: `weddings`, `wedding_members`, `invitations`, `budget_categories`, `budget_items`, `funding_sources`, `payments`,
`vendor_slots`, `vendor_candidates`, `score_criteria`, `vendor_scores`, `vendor_meetings`, `tasks`, `media_assets`, `activity_logs`
(+ `users`, `sessions`, `cache`, `jobs`). Semua tabel data punya `wedding_id`. Migrasi: `database/migrations/2026_10_24_*`.

Uang: integer rupiah. Hari H: kolom `date` (perkiraan bila `date_is_estimated`).

## Rumus anggaran (`BudgetCalculator`)
- Estimasi item: `per_guest` → `harga_per_tamu × jumlah_tamu`; selain itu rentang `min..max` (dibalik bila terbalik), `mid = floor((min+max)/2)`.
- Proyeksi item = `agreed_amount` bila ada; jika tidak `mid + round(mid × buffer%)`.
- `subtotal = Σ proyeksi`; `kontingensi = round(subtotal × contingency%)`; `proyeksi_total = subtotal + kontingensi`.
- `sisa_bayar = Σ max(0, agreed − paid)` hanya item yang sudah disepakati; pembayaran > kesepakatan ditandai.
- Status: total anggaran kosong/0 → `unknown`; proyeksi > anggaran → `over`; proyeksi ≥ `warning%` anggaran → `near`; selain itu `safe`.
- Pembulatan persen: setengah ke atas (`intdiv(x·p + 50, 100)`).

## Tabungan (`SavingsPlanner`)
Kebutuhan = proyeksi total − dana terkumpul; per bulan = kebutuhan / sisa bulan; `on_track` bila setoran terencana ≥ kebutuhan per bulan; juga menghitung bulan/tanggal dana tercapai.

## Timeline (`TimelineScheduler`)
Tugas template memakai `offset_value` + `offset_unit` relatif terhadap Hari H. Mengubah Hari H menghitung ulang tugas yang belum diedit manual; pratinjau mengembalikan `to=null`, `ideal`, `needs_reschedule` untuk tanggal yang sudah lewat, tanpa menulis apa pun.
