# PROGRESS

## Tinjauan visual (Gerbang 5)

Screenshot nyata (data contoh, bukan data pengguna) ada di `docs/screenshots/` pada 360, 768, 1024, dan 1440 px:
login, onboarding, dashboard, anggaran, detail kategori anggaran, timeline (+ mode fokus), pengaturan, daftar vendor,
detail slot vendor, dan perbandingan kandidat. Seluruh halaman dibuka di Chromium tanpa error konsol.

Yang diperiksa dengan melihat gambarnya (dashboard 360/1440, anggaran 360/1440, perbandingan vendor 1440, timeline 360, onboarding 768):

- Tidak ada scroll horizontal di 360 px; tab bar bawah muncul di mobile, navigasi atas di desktop.
- Angka uang memakai satu gaya (Fraunces, tabular) dan rupiah konsisten.
- Status tidak hanya warna: ada label ("Aman", "terlambat 6 hari") dan ikon.
- Fokus terlihat jelas pada input (cincin terracotta).

Tiga pertanyaan anti-slop:

1. *Apakah ini terlihat seperti template AI generik?* Tidak: palet ivory/terracotta, tipografi serif editorial, tanpa gradien/kartu bertumpuk/ikon dekoratif.
2. *Apakah setiap elemen punya fungsi?* Ya; bagian diberi nomor dan judul, tanpa dekorasi kosong.
3. *Apakah angka dan label bisa dipercaya?* Ya; semua dihitung dari domain class yang diuji, dan data contoh berlabel "contoh".

Catatan yang diterima / belum dikerjakan:

- Di screenshot fullPage, header sticky dan tab bar mobile tampak di tengah halaman (artefak pengambilan gambar, bukan bug).
- Rentang estimasi ("Rp A - Rp B") membungkus dua baris di kolom sempit pada tabel anggaran desktop; dapat dirapikan.
- Halaman timeline di 360 px panjang; filter sudah ada, tapi belum dikelompokkan collapsible.

## Status

Lihat `docs/STATUS.md` (belum ditulis) untuk daftar selesai / sebagian / belum.
