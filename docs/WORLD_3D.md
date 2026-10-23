# Dunia 3D (Our Little World)

## Aset
`public/assets/wedding_planner_chibi_couple.glb` (292 KB), dimuat dengan `useGLTF` dari `/assets/...`.
Hasil inspeksi file: 124 node, 123 mesh, 24 material; **tanpa skin, tanpa rig, tanpa animation clip**.
Sumbu **Z ke atas** dan wajah menghadap -Y (bukan konvensi glTF Y-up), sehingga `components/three/couple.tsx`
memutarnya -90° pada X. Proporsi dan material tidak diubah. Karena statis, tidak ada animasi karakter;
yang bergerak hanya kamera (parallax halus), awan, dan hati.

Keterbatasan prototipe: bagian-bagian berupa bentuk geometris sederhana (lengan/tangan dari silinder + sendi), wajah belum
mirip foto referensi, tidak ada rambut bergelombang halus. Rencana perbaikan: sculpt ulang kepala/rambut, tambah rig humanoid
sederhana, lalu ekspor klip idle/sapa/rayakan.

## Struktur
- `three/world-stage.tsx` — pembungkus DOM: deteksi WebGL, reduced-motion, mode hemat daya, error boundary, tombol "ilustrasi statis" (tersimpan di localStorage), tautan navigasi setara.
- `three/world-canvas.tsx` — scene (dimuat malas lewat `lazy`, chunk terpisah ±930 KB / 254 KB gzip).
- `three/props.tsx` — benda yang bisa diklik: lengkungan → `/timeline`, kalender → `/timeline#tambah`, bingkai foto → `/kenangan`, kotak tabungan → `/anggaran`, kotak surat → `/catatan`.
- `three/static-world.tsx` — fallback SVG.
- Landing memakai `interactive={false}` (tujuan klik adalah halaman privat).

Tanpa Environment/HDR dari CDN: pencahayaan hemisphere + directional, sehingga bekerja offline.

## Status verifikasi (jujur)
Lulus: `tsc`, `eslint`, `prettier`, `npm run build`, Pest, `npm audit`; GLB tersaji 200 `model/gltf-binary`.
**Belum diverifikasi secara visual**: browser yang tersedia saat pengerjaan berada di mesin lain dan tidak bisa membuka
`localhost`. Framing kamera, skala pasangan, posisi benda, hover, dan sentuhan belum dilihat. Cek manual pertama:
buka `/` dan `/dashboard`, lalu sesuaikan `SCALE` di `couple.tsx` serta `CAMERA_HOME` di `world-canvas.tsx` bila perlu.
