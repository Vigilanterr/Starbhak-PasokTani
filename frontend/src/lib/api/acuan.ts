/**
 * "Hari ini" untuk data tiruan. Dipakai sebagai konstanta (bukan `new Date()`) agar halaman
 * tetap bisa di-prerender dan hasil server/klien sama. Backend nanti menghitung ini sendiri.
 * File ini sengaja terpisah dari `katalog.ts` agar aman diimpor Client Component tanpa ikut
 * membawa seluruh data JSON ke bundle klien.
 */
export const TANGGAL_ACUAN = "2026-11-04";
