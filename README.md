# SewaTech — Prototype

Prototype mobile app marketplace sewa barang elektronik (Tubes II3120 Kelompok 3).
Dibuat dengan **Expo (React Native) + Expo Router + TypeScript**. Semua data masih dummy (in-memory), dan respon dari sisi penyedia/admin disimulasikan otomatis.

## Menjalankan

```bash
npm install
npx expo start
```

- **Di HP:** install aplikasi **Expo Go**, lalu scan QR yang muncul di terminal (HP dan laptop harus di Wi-Fi yang sama).
- **Di browser:** tekan `w` di terminal, atau jalankan `npx expo start --web`.

Di halaman awal, pilih **"Sudah punya akun? Masuk"** untuk langsung pakai akun demo terverifikasi, atau **"Daftar akun baru"** untuk mencoba alur registrasi + verifikasi KTP. Di web, tambahkan `?demo=1` di URL untuk langsung masuk.

## Demo online & CI/CD

Versi web otomatis ter-deploy ke **https://greeyash.github.io/II3120_SewaTech/** setiap ada perubahan di branch `main`.

- **CI** (`.github/workflows/ci.yml`): setiap push ke branch fitur dan setiap pull request ke `main` dicek dengan `npm run typecheck` dan `npm run build:web`. Pull request sebaiknya baru di-merge kalau centangnya hijau.
- **CD** (`.github/workflows/deploy.yml`): setiap push ke `main` (termasuk merge pull request) di-build lalu di-deploy ke GitHub Pages.

Cek lokal sebelum push:

```bash
npm run typecheck
npm run build:web
```

## Aturan bisnis (sesuai laporan)

- Deposit = nilai taksir × **30%** (penyewa baru) atau **20%** (penyewa terpercaya, ≥ 2 sewa selesai).
- Rincian biaya hanya **sewa + deposit** (tidak ada biaya layanan).
- Pesanan yang belum dibayar kedaluwarsa setelah **1×24 jam**.
- Pengingat dikirim **1×24 jam** sebelum masa sewa berakhir; denda telat **50% tarif/hari**, dipotong dari deposit.
- Klaim kerusakan dimediasi **customer service**; potongan tidak melebihi deposit.

## Pemetaan layar ke tahap BPMN

| Tahap BPMN | Layar | File |
|---|---|---|
| 2.1 Registrasi & Verifikasi | Daftar → Upload KTP & selfie → status verifikasi (bisa simulasi ditolak) | `src/app/register.tsx`, `src/app/verify.tsx` |
| 2.2 Listing | Form sewakan barang → status "dikurasi admin" → tayang | `src/app/listing/new.tsx`, tab Akun |
| 2.2 Pencarian | Beranda, Cari + filter lokasi/harga/ketersediaan, detail + jadwal | `src/app/(tabs)/index.tsx`, `search.tsx`, `src/app/item/[id].tsx` |
| 2.3 Diskusi & Negosiasi | Chat, tawar, kontra-penawaran, terima/tolak, harga final tercatat | `src/app/chat/[id].tsx` |
| 2.4 Pemesanan | Pilih tanggal & durasi, cek ketersediaan, setujui SOP → menunggu penyedia | `src/app/book/[id].tsx` |
| 2.5 Pembayaran & Deposit | Rincian biaya, deposit dari nilai taksir × status penyewa, bayar (bisa simulasi gagal) → escrow | `src/app/pay/[id].tsx` |
| 2.6 Serah Terima & Masa Sewa | Dokumentasi kondisi awal, langsung/kurir, konfirmasi terima, hitung mundur + pengingat | `src/app/order/[id].tsx` |
| 2.7 Pengembalian, Klaim, Penilaian | Konfirmasi kembali, simulasi pemeriksaan (sesuai/tidak), klaim & mediasi, rating dua arah | `src/app/order/[id].tsx`, `src/app/review/[id].tsx` |

## Struktur

- `src/app/` — layar (Expo Router, berbasis file)
- `src/components/ui.tsx` — komponen UI bersama
- `src/data.ts` — data dummy barang, penyedia, SOP
- `src/store.tsx` — state aplikasi + simulasi respon penyedia/admin
- `src/theme.ts` — warna & token desain (sama dengan variabel di Figma)
- `assets/products/` — foto produk dari desain Figma
