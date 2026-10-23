# Design system

Sumber kebenaran: `design-system/wedding-planner-pribadi/MASTER.md` (+ override di `pages/`).
Dokumen ini merangkum keputusan dan menjelaskan alasannya.

## Konsep visual
Buku catatan pernikahan di atas kertas ivory hangat: tinta plum, aksen coral-blush dengan latar mint, angka uang yang besar dan tenang.

## Font
- **Fraunces Variable** (heading, angka hero) — serif editorial yang tetap terbaca kecil.
- **Hanken Grotesk Variable** (body/UI) — sans netral untuk tabel dan form.
- Keduanya self-host lewat `@fontsource-variable/*`, `font-display: swap`. Bukan Inter/Roboto/Arial.

## Palet dan kontras
Terukur (rumus luminansi WCAG) — lihat tabel di MASTER.md. Ringkas: teks utama 13,73:1, teks sekunder 7,13:1,
caption 5,22:1, aksen 6,05:1, teks di atas aksen 6,42:1; tiga warna status ≥ 6,2:1. Border kontrol memakai `--line-strong`.

## Spacing / radius / bayangan
Skala 4 px (`4 8 12 16 24 32 48 64 96`). Radius kontrol 6 px, permukaan 4 px. Tidak ada bayangan kecuali popover.

## Foto
Aplikasi menampilkan foto milik pengguna (moodboard, kunjungan vendor): rasio 4:3 untuk daftar, 3:2 untuk detail,
`object-fit: cover`, caption di bawah, tanpa overlay gelap. Dimuat privat lewat signed URL.

## Komponen kustom
`MoneyFigure`, `StatusBadge`, `ProgressRule`, `SectionHeading`, `EmptyState`, `PageHeader`, `ConfirmDialog`.
Komponen shadcn dipakai sebagai primitif aksesibel dan distel ulang lewat token (radius, warna, fokus).

## Motion
150 ms (hover/fokus), 220 ms (panel/status), easing `cubic-bezier(.2,.7,.2,1)`. Reduced-motion mematikannya.

## Sketsa halaman
- **Login**: kolom sempit rata kiri; judul Fraunces; form; garis tipis; tautan lupa password. Tanpa pendaftaran.
- **Dashboard**: (1) countdown besar + fase saat ini; (2) tiga angka anggaran sejajar dengan pemisah vertikal;
  (3) rencana tabungan sebagai satu kalimat + `ProgressRule`; (4) daftar "Perlu perhatian" bertanggal;
  bar pintasan bawah di ponsel. Ruang kosong lebar di sisi kanan countdown pada desktop.
- **Anggaran**: judul + total proyeksi besar; status (ikon+teks); tabel kategori → item dengan kolom Estimasi/Kesepakatan/Terbayar;
  panel Sumber dana di bawah. Di ponsel: daftar baris dua lapis.
- **Timeline**: sakelar Roadmap / Kalender / Fokus; roadmap per fase bernomor editorial (I–IX), tugas sebagai daftar bertanggal.
- **Vendor**: daftar slot dengan status pipeline; detail slot berisi kandidat; perbandingan sampai 4 kandidat
  (kolom berdampingan di desktop, gulir horizontal bersnap di ponsel).
