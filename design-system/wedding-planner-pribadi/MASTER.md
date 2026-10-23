# MASTER — Wedding Planner Pribadi

> Halaman dengan file di `pages/` memakai file itu sebagai pengganti aturan di sini.
> Untuk aksesibilitas, aturan di dokumen ini yang menang atas preferensi visual.

## Keputusan override terhadap output mentah skill `ui-ux-pro-max`

Skill dijalankan dengan konteks "aplikasi perencana pernikahan pribadi, editorial hangat dan tenang,
mobile-first, Indonesia" (dial Variance 5, Motion 3, Density 6). Output mentahnya **ditolak**:

| Output skill | Keputusan | Alasan |
| --- | --- | --- |
| Palet hitam `#18181B` + aksen pink `#EC4899` | Ditolak | Terasa seperti toko mode / SaaS, bukan buku catatan hangat. Pink murni juga melanggar daftar anti-slop. |
| Font Caveat + Quicksand (tulisan tangan) | Ditolak | Tulisan tangan sulit dibaca untuk tabel angka keuangan. |
| Gaya "Academia" (mahoni, vignette, brass) | Ditolak | Gelap dan bertema perpustakaan; tidak cocok untuk anggaran yang harus menenangkan. |
| Pola "Minimal Single Column" | Dipakai sebagian | Berlaku untuk login dan onboarding saja. |
| Checklist pra-pengiriman (tanpa emoji, cursor-pointer, kontras 4.5:1, reduced-motion, 4 viewport) | Dipakai | Menjadi Gerbang 5. |
| Motion subtle 300–400 ms | Dipakai dengan durasi lebih pendek | Dipersingkat menjadi 150–220 ms. |

## Konsep
Buku catatan pernikahan yang dirancang dengan baik: kertas ivory hangat, tinta plum,
aksen coral-blush dengan latar mint. Angka uang besar dan tenang, dengan label status yang dibaca lewat teks + ikon.

## Dials
- **Variance 5** — halaman login, onboarding, dan countdown boleh asimetris; anggaran dan vendor rapi dan terstruktur.
- **Motion 3** — hanya transisi bermakna (buka panel, perubahan status, progres). Tidak ada fade-up massal.
- **Density 6** — lapang di ringkasan, padat di tabel anggaran dan daftar tugas.

## Token warna (light)

Sumber palet: Color Hunt `F29191 F7ADAD B1E5E6 CCFBFA` + ivory `#FFF9F5` dan plum `#49343D` (docs/OUR_LITTLE_WORLD.md).
Menggantikan palet ivory/terracotta sebelumnya. Token utilitas pastel: `coral`, `blush`, `aqua`, `mint`, `ivory`, `plum`.

| Token | Hex | Kegunaan | Kontras terukur |
| --- | --- | --- | --- |
| `--paper` | `#FFF9F5` | latar halaman (Warm Ivory) | — |
| `--card` | `#FFFDFB` | permukaan terangkat | — |
| `--sunk` | `#E6F7F6` | permukaan tertekan (tint Mint Ice) | — |
| `--ink` | `#49343D` | teks utama (Deep Plum) | 10,92 di atas paper |
| `--ink-soft` | `#645059` | teks sekunder | 7,10 |
| `--ink-faint` | `#765F6A` | caption, label | 5,57 (5,26 di atas sunk) |
| `--line` | `#ECDAD8` | garis dekoratif | — |
| `--line-strong` | `#8C7480` | border input/kontrol | 4,09 (≥ 3:1) |
| `--primary` | `#F29191` | latar tombol utama (Coral Pink); teks plum di atasnya | 5,01 |
| `--brand` | `#B04545` | tautan, state aktif, progres (coral versi gelap untuk teks) | 5,32; 5,02 di atas sunk |
| `--brand-soft` | `#FCE4E2` | latar chip aksen / hari ini | brand di atasnya 4,58 |
| `--sage` | `#2B6A6A` | status aman / selesai | 5,97 |
| `--sage-soft` | `#D9F6F5` | latar status aman | 5,47 |
| `--amber` | `#85541A` | status perlu perhatian | 6,13 |
| `--amber-soft` | `#FBEBD3` | latar status mendekati | 5,46 |
| `--danger` | `#B03040` | status melebihi / error | 6,02 |
| `--danger-soft` | `#FCE0E0` | latar status melebihi | 5,05 |

Coral murni tidak dipakai sebagai warna teks (2,3:1 di atas ivory). Amber dan danger di luar palet Color Hunt dipertahankan sebagai warna semantik agar status tetap bisa dibedakan.

Mode gelap (tidak boleh rusak): `--paper #2B1F25`, `--card #36272E`, `--ink #FFF9F5` (15,18), `--ink-faint #C9B3BC` (8,04),
`--brand #F29191` (6,97). Tidak ada `#fff` atau `#000` murni.

**Status anggaran tidak bergantung warna:** setiap status = ikon + kata ("Aman", "Mendekati batas", "Melebihi") + warna.

> Catatan nama: `--brand` (bukan `--accent`) karena `--accent` pada shadcn dipakai untuk latar hover.

## Tipografi (maksimal 2 keluarga, self-host, `font-display: swap`)
- **Heading: Fraunces Variable** — serif editorial dengan karakter hangat; dipakai untuk h1–h3 dan angka besar di ringkasan.
- **Body/UI: Hanken Grotesk Variable** — sans netral yang nyaman untuk tabel dan form.
- Angka uang selalu `font-variant-numeric: tabular-nums`.
- Skala: 12 / 14 / 16 (body) / 18 / 24 / 32 / 44 / 64 (angka hero). Line-height body 1,55.
- Alasan memilih Fraunces dan bukan Playfair/Cormorant: tetap terbaca di ukuran kecil dan tidak terlalu "pernikahan klise".

## Spacing, radius, bayangan
- Basis 4 px: `4 8 12 16 24 32 48 64 96`. Jarak antar-section memakai 48/64/96.
- Radius: kontrol 6 px, permukaan 4 px, chip penuh. Tidak ada radius besar di mana-mana.
- Bayangan: tidak ada pada permukaan; hanya popover/dialog (`0 8px 24px rgb(42 36 32 / .12)`). Pemisah memakai garis tipis.

## Motion
- Durasi 150 ms (hover/fokus) dan 220 ms (panel, perubahan status). Easing `cubic-bezier(.2,.7,.2,1)`.
- `prefers-reduced-motion: reduce` mematikan semua transisi non-esensial.

## Ikon & aset
- Satu pustaka: `lucide-react`, stroke 1.5. Tidak ada emoji sebagai ikon. Ikon hanya bila menambah makna.
- Tanpa foto stok. Empty state memakai tipografi + garis SVG buatan sendiri.

## Komponen kustom
`MoneyFigure` (angka uang besar), `StatusBadge` (ikon+teks+warna), `ProgressRule` (progres berupa garis tipis berlabel),
`SectionHeading` (nomor editorial + judul), `EmptyState`, `PageHeader`, `ConfirmDialog` (aksi destruktif).

## Anti-pattern (diperiksa di Gerbang 5)
Hero tengah + tiga kartu sama besar; kartu berborder+bayangan di mana-mana; gradient; emoji ikon; copy klise;
angka karangan; animasi masuk di setiap elemen; template admin (sidebar gelap + kartu statistik warna-warni).

## Checklist pra-pengiriman
- [ ] Tanpa emoji ikon; satu set ikon, satu stroke
- [ ] Kontras teks ≥ 4,5:1; kontrol ≥ 3:1
- [ ] `focus-visible` terlihat di semua kontrol; target sentuh ≥ 44 px
- [ ] `prefers-reduced-motion` dihormati
- [ ] Status tidak hanya warna
- [ ] Tampil benar di 360 / 768 / 1024 / 1440 px tanpa scroll horizontal
