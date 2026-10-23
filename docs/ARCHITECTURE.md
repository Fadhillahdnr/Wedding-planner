# Arsitektur

Monolit Laravel 12 + Inertia v2 (React 19, TypeScript, Tailwind v4, shadcn/Radix). PostgreSQL. Tanpa API terpisah.

- `app/Domain/{Budget,Timeline,Templates,Vendors}` — kelas murni (tanpa I/O) berisi seluruh rumus dan aturan; diuji unit.
- `app/Services` — orkestrasi dengan DB: `BudgetOverview`, `VendorSelection` (transaksi pilih vendor), `ScheduleService`, `ActivityLogger`.
- `app/Http` — controller tipis, FormRequest per aksi, middleware `workspace` (`EnsureWorkspace`: `any|onboarded`).
- `app/Models/Concerns/BelongsToWedding` — global scope `wedding_id` dari user yang login + hook `creating`. ID lintas workspace → 404.
- Peran: `owner` dan `partner` (`wedding_members`). Hanya owner mengundang/mencabut anggota dan mengubah Hari H.
- Undangan: token acak, hanya hash sha256 disimpan, kedaluwarsa 7 hari, sekali pakai, dapat dicabut.
- Frontend: `resources/js/pages/{dashboard,budget,timeline,vendors,settings,auth}`, komponen domain di `components/{planner,budget,timeline,vendors}`. Token desain di `resources/css/app.css`.
- Keputusan: template tugas/anggaran adalah konstanta PHP (`WeddingTemplates`) yang diterapkan idempoten oleh `TemplateApplier`, bukan tabel `task_templates`.
- Satu kandidat `terpilih` per slot dijamin partial unique index di DB.
- `preventLazyLoading` aktif di luar produksi.
