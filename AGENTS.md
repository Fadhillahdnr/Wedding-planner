# AGENTS.md

Wedding planner pribadi untuk dua orang (owner + pasangan). Bukan situs publik, bukan marketplace.

## Perintah
- Test: `vendor/bin/pest` (butuh PostgreSQL di 127.0.0.1:5433, lihat `phpunit.xml`). Jangan arahkan test ke DB asli.
- Format: `vendor/bin/pint`, `npm run format`. Cek: `npx eslint resources/js`, `npx tsc --noEmit`, `npm run build`.
- Buat owner: `php artisan app:create-owner --name=... --email=... --password=...` (min 12 karakter).

## Aturan
- Uang = integer rupiah. Hari H = `date`. Semua rumus hanya di `app/Domain/*`.
- Semua model data pengguna memakai trait `BelongsToWedding`; `Rule::exists` harus diberi `->where('wedding_id', ...)`.
- Tidak ada pendaftaran publik. Undangan: token di-hash, 7 hari, sekali pakai.
- Jangan commit `.env` atau rahasia. Jangan minify/obfuscate kode.
- UI: ikuti `design-system/wedding-planner-pribadi/MASTER.md` dan `docs/DESIGN_SYSTEM.md`; pakai token, bukan hex mentah.
- Data template berlabel umum; jangan mengarang vendor, harga, atau aturan hukum.
- Jangan push ke `main` / buat PR kecuali diminta.
