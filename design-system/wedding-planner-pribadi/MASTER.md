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
Buku catatan pernikahan yang dirancang dengan baik: kertas ivory hangat, tinta charcoal-cokelat,
satu aksen terracotta. Angka uang besar dan tenang, dengan label status yang dibaca lewat teks + ikon.

## Dials
- **Variance 5** — halaman login, onboarding, dan countdown boleh asimetris; anggaran dan vendor rapi dan terstruktur.
- **Motion 3** — hanya transisi bermakna (buka panel, perubahan status, progres). Tidak ada fade-up massal.
- **Density 6** — lapang di ringkasan, padat di tabel anggaran dan daftar tugas.

## Token warna (light)

| Token | Hex | Kegunaan | Kontras terukur |
| --- | --- | --- | --- |
| `--paper` | `#F7F2E9` | latar halaman | — |
| `--card` | `#FCF9F3` | permukaan terangkat | — |
| `--sunk` | `#EFE7D9` | permukaan tertekan, header tabel | — |
| `--ink` | `#2A2420` | teks utama | 13,73 di atas paper |
| `--ink-soft` | `#5A4F46` | teks sekunder | 7,13 |
| `--ink-faint` | `#6F6359` | caption, label | 5,22 (4,74 di atas sunk) |
| `--line` | `#DDD2C0` | garis dekoratif (bukan kontrol) | — |
| `--line-strong` | `#8F8271` | border input/kontrol | ≥ 3:1 (WCAG 1.4.11) |
| `--brand` | `#9A3F27` | CTA, tautan, state aktif | 6,05; teks `#FCF9F3` di atasnya 6,42 |
| `--brand-soft` | `#F0DCD2` | latar chip aksen | — |
| `--sage` | `#44604A` | status aman / selesai | 6,24 |
| `--sage-soft` | `#E1E8DC` | latar status aman | — |
| `--amber` | `#7A5200` | status mendekati / perlu perhatian | 6,21 |
| `--amber-soft` | `#F3E5C3` | latar status mendekati | — |
| `--danger` | `#A12B2B` | status melebihi / error | 6,50 |
| `--danger-soft` | `#F4D9D6` | latar status melebihi | — |

Mode gelap (tidak boleh rusak): `--paper #1C1815`, `--card #26211D`, `--ink #F1EADF` (14,76),
`--ink-faint #B3A697` (7,40), `--brand #E0866B` (6,54). Tidak ada `#fff` atau `#000` murni.

**Status anggaran tidak bergantung warna:** setiap status = ikon + kata ("Aman", "Mendekati batas", "Melebihi") + warna.

> Catatan nama: terracotta bernama `--brand` (bukan `--accent`) karena `--accent` pada shadcn dipakai untuk latar hover.

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
