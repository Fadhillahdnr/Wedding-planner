# Landing sinematik (Our Little World)

Spesifikasi: `docs/CINEMATIC_WEDDING_PLANNER_LANDING_PAGE.md`. Halaman: `resources/js/pages/landing.tsx`.

## Aset video
- Sumber (tidak diubah): `public/assets/Chibi_couple_under_wedding_arch_20261023150634.mp4`.
- Salinan yang dipakai: `public/videos/our-little-world.mp4` (identik, bukan hasil kompresi).
- Hasil inspeksi: 10,0 dtk, 1280×720 (16:9), H.264 + trek audio AAC, 3,9 MB. Isi: pasangan di tengah, di bawah lengkungan bunga; tulisan "Our Little World" sudah menempel di kiri atas video.
- **Tidak dioptimasi**: FFmpeg tidak terpasang di mesin ini. Belum dibuat poster, crop mobile khusus, atau versi tanpa audio. Video dibisukan lewat atribut `muted`.
- **Kemulusan loop belum diperiksa** (belum ada pembandingan bingkai awal dan akhir). Bila ada loncatan saat mengulang, perlu diedit di luar.

## Referensi Aanaya-web (dibaca langsung dari source)
`resources/js/welcome-experience/WelcomeExperience.js` dan `about-experience/AboutExperience.js` memakai GSAP + ScrollTrigger (tanpa Lenis). Yang diadaptasi:
1. wrapper tinggi + `ScrollTrigger` `scrub: .7` dari `top top` ke `bottom bottom`, nilai di-`set` dari progres;
2. lapisan `data-depth` untuk parallax per kedalaman;
3. reveal sekali jalan `start: 'top 88%', once: true`;
4. kata-kata judul muncul bertahap ber-scrub;
5. kelas nav toggle lewat `toggleClass`;
6. `ScrollTrigger.refresh` setelah `document.fonts.ready`/`load`, dan reduced motion = tanpa animasi.
Tidak diadaptasi: partikel tipografi, kursor kustom, magnet, dan scrub `currentTime` video (`article-experience/ArticleVideo.js`).

## Cara kerja
- **Pustaka**: `gsap@3.13` saja (ScrollTrigger). Tidak ada Lenis: scroll tetap native, tidak ada snapping atau penguncian scroll.
- **Adegan 1–3** (`<section data-story>`, 300svh desktop / 240svh mobile; stage `sticky`): satu timeline ber-scrub. Teks pembuka naik dan memudar → "Semua dimulai dari sebuah mimpi." muncul (blur → jelas) → video membesar pelan (1→1,12) dan, di desktop, menyusut menjadi jendela `clip-path` berbingkai di atas latar gading → kalimat penutup muncul di bawah jendela.
- **Adegan 4–6**: makna aplikasi (3 baris editorial), perjalanan persiapan (fase template asli dari `WeddingTemplates::PHASES`, garis terisi mengikuti scroll), ajakan masuk. Semua tautan ke `/login`, satu-satunya rute publik yang relevan.
- **Video**: strategi A (loop biasa). Scroll tidak menyentuh `currentTime`. Ada tombol "Jeda video/Putar video" (autoplay bisa diblokir; reduced motion tidak memutar otomatis).
- **Mobile**: video di 64svh bagian atas (kedua karakter utuh), teks di bawahnya di atas latar gading; tanpa penyusutan jendela; skala lebih kecil.
- **Reduced motion**: tidak ada tween; stage tidak sticky/tinggi; hanya teks pembuka yang tampil (teks adegan 2–3 disembunyikan); video tidak diputar otomatis.
- **Siklus hidup**: `gsap.matchMedia()` + `gsap.context()`, dibersihkan saat unmount.

## Verifikasi (jujur)
Dilihat langsung di Chrome macOS terhadap `localhost:8000`: adegan pembuka, transisi awal, adegan tengah (jendela), bagian makna, perjalanan, CTA + footer di desktop; mobile 390 px lewat iframe (tanpa overflow horizontal: 390/390); video diputar; tanpa pesan error konsol. Lolos: `tsc`, `eslint`, `prettier`, `npm run build`, Pest 128, `npm audit`.
**Belum diuji**: reduced motion (preferensi OS tidak bisa diubah dari alat yang ada), tablet, Safari/Firefox, jaringan lambat, kembali ke atas setelah navigasi Inertia (cleanup hanya dibaca dari kode).
