'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { UnggahFoto } from '../../common/UnggahFoto';

export interface ProfilTokoData {
  namaToko: string;
  deskripsiToko: string;
  fotoProfil?: string;
  nomorHp: string;
  alamatLahan: string;
  provinsi?: string;
  kotaKabupaten?: string;
  kecamatan?: string;
  kodePos?: string;
  titikKoordinat?: { lat: number; lng: number };
  patokan?: string;
}

export interface TokoPengaturanProfilProps {
  profil?: ProfilTokoData;
  onSimpanProfil?: (profil: ProfilTokoData) => void;
  hrefPengaturan?: string;
  className?: string;
}

const DEFAULT_PROFIL: ProfilTokoData = {
  namaToko: 'Kebun Mang Ujang',
  deskripsiToko: 'Petani sayur organik di lereng Gunung Tangkuban Parahu sejak 2018. Panen pagi, kirim siang.',
  fotoProfil: '/images/toko/mang-ujang.jpg',
  nomorHp: '0813-2207-1144',
  alamatLahan: 'Kp. Cikole RT 02/RW 07, Desa Cikole',
  provinsi: 'Jawa Barat',
  kotaKabupaten: 'Kab. Bandung Barat',
  kecamatan: 'Lembang',
  kodePos: '40391',
  patokan: 'Gerbang kebun hijau 200m setelah Warung Kopi Tanjakan',
  titikKoordinat: { lat: -6.7912, lng: 107.6253 },
};

export function TokoPengaturanProfil({
  profil = DEFAULT_PROFIL,
  onSimpanProfil,
  hrefPengaturan = '/toko/pengaturan',
  className = '',
}: TokoPengaturanProfilProps) {
  const [formData, setFormData] = useState<ProfilTokoData>(profil);
  const [fotoStatus, setFotoStatus] = useState<'kosong' | 'siap'>('siap');
  const [tersimpan, setTersimpan] = useState<boolean>(false);
  const [galatList, setGalatList] = useState<Array<{ href: string; pesan: string }>>([]);
  const [ketTitik, setKetTitik] = useState<string>(
    '-6.79120, 107.62530 · Akurasi titik sekitar 15 meter.'
  );

  const handleGeserTitik = () => {
    const latBaru = -6.7912 + (Math.random() - 0.5) * 0.001;
    const lngBaru = 107.6253 + (Math.random() - 0.5) * 0.001;
    setFormData((prev) => ({
      ...prev,
      titikKoordinat: { lat: latBaru, lng: lngBaru },
    }));
    setKetTitik(
      `${latBaru.toFixed(5)}, ${lngBaru.toFixed(5)} · Titik digeser ke posisi baru.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Array<{ href: string; pesan: string }> = [];

    if (!formData.namaToko || formData.namaToko.trim().length < 3) {
      errors.push({ href: '#pr-nama', pesan: 'Nama toko minimal 3 huruf.' });
    }
    if (formData.namaToko.length > 40) {
      errors.push({ href: '#pr-nama', pesan: 'Nama toko maksimal 40 huruf.' });
    }
    if (formData.deskripsiToko.length > 300) {
      errors.push({ href: '#pr-desk', pesan: 'Keterangan maksimal 300 huruf.' });
    }

    const cleanHp = formData.nomorHp.replace(/[\s-]/g, '');
    const isHpValid = /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(cleanHp);
    if (!isHpValid) {
      errors.push({
        href: '#pr-hp',
        pesan: 'Nomor HP belum benar. Contoh: 0813-2207-1144',
      });
    }

    if (!formData.alamatLahan || formData.alamatLahan.trim().length < 5) {
      errors.push({
        href: '#pr-alamat',
        pesan: 'Alamat lahan wajib diisi lengkap.',
      });
    }

    if (errors.length > 0) {
      setGalatList(errors);
      setTersimpan(false);
      return;
    }

    setGalatList([]);
    setTersimpan(true);
    if (onSimpanProfil) {
      onSimpanProfil(formData);
    }
  };

  const initials = formData.namaToko
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  const salahNama = galatList.some((g) => g.href === '#pr-nama');
  const salahHp = galatList.some((g) => g.href === '#pr-hp');
  const salahAlamat = galatList.some((g) => g.href === '#pr-alamat');

  return (
    <div className={`min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="pengaturan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[1040px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href={hrefPengaturan}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-[#157a4c] text-sm font-bold no-underline"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Pengaturan toko
            </Link>

            {/* Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Profil toko
              </h1>
              <p className="mt-1.5 mb-0 text-sm text-[#5a6b60]">
                Tanda <span aria-hidden="true" className="text-[#b42318] font-extrabold">*</span> wajib diisi.
              </p>
            </div>

            {/* Validation Error Alert */}
            {galatList.length > 0 && (
              <div
                role="alert"
                className="p-3.5 px-4 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea]"
              >
                <p className="m-0 mb-1.5 text-sm font-extrabold text-[#8a1c12]">
                  Periksa kembali isian berikut:
                </p>
                <ul className="m-0 pl-4.5 text-sm leading-relaxed text-[#8a1c12]">
                  {galatList.map((g, idx) => (
                    <li key={idx}>
                      <a href={g.href} className="font-bold underline text-[#8a1c12]">
                        {g.pesan}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Status Banner */}
            {tersimpan && (
              <p
                role="status"
                className="m-0 flex items-center gap-2.5 p-3 px-3.5 border-[1.5px] border-[#064e3b] rounded-xl bg-[#f3faf3] text-sm font-bold text-[#064e3b]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#157a4c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Profil toko disimpan.
              </p>
            )}

            {/* Two-Column Form Layout */}
            <div className="flex flex-wrap items-start gap-4.5">
              {/* Form Column */}
              <form
                onSubmit={handleSubmit}
                className="flex-[999_1_460px] min-w-0 m-0 flex flex-col gap-3.5"
              >
                {/* Section 1: Tampilan Toko */}
                <section
                  aria-labelledby="judul-tampilan-toko"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4"
                >
                  <h2 id="judul-tampilan-toko" className="text-[17px] font-extrabold m-0">
                    Tampilan toko
                  </h2>

                  <div className="max-w-[200px]">
                    <UnggahFoto
                      status={fotoStatus}
                      label="Foto toko"
                      wajib={false}
                      ukuran="Foto lama, dipakai sejak Sep 2026"
                      onPilih={() => setFotoStatus('siap')}
                      onUlang={() => setFotoStatus('siap')}
                      onHapus={() => setFotoStatus('kosong')}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pr-nama" className="text-[15px] font-bold text-[#173b2b]">
                      Nama toko <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </label>
                    <input
                      id="pr-nama"
                      type="text"
                      autoComplete="organization"
                      value={formData.namaToko}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, namaToko: e.target.value }))
                      }
                      aria-invalid={salahNama}
                      aria-describedby="pr-nama-ket"
                      className={`h-13 px-3.5 border-[1.5px] rounded-xl bg-white text-[#173b2b] text-base outline-none ${
                        salahNama ? 'border-[#b42318]' : 'border-[#dee3da]'
                      }`}
                    />
                    <p id="pr-nama-ket" className="m-0 text-[13px] text-[#5a6b60]">
                      3 sampai 40 huruf. Nama ini tampil di semua produk dan pesananmu.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pr-desk" className="text-[15px] font-bold text-[#173b2b]">
                      Keterangan toko{' '}
                      <span className="font-normal text-[#5a6b60]">(opsional)</span>
                    </label>
                    <textarea
                      id="pr-desk"
                      rows={3}
                      value={formData.deskripsiToko}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, deskripsiToko: e.target.value }))
                      }
                      aria-describedby="pr-desk-ket"
                      className="w-full p-3 px-3.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-base leading-relaxed outline-none resize-y"
                    />
                    <p id="pr-desk-ket" className="m-0 flex justify-between gap-3 text-xs text-[#5a6b60]">
                      <span>Ceritakan lahan dan cara panenmu.</span>
                      <span className={`font-bold ${formData.deskripsiToko.length > 300 ? 'text-[#b42318]' : ''}`}>
                        {formData.deskripsiToko.length}/300
                      </span>
                    </p>
                  </div>
                </section>

                {/* Section 2: Kontak dan Alamat Lahan */}
                <section
                  aria-labelledby="judul-kontak-alamat"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4"
                >
                  <h2 id="judul-kontak-alamat" className="text-[17px] font-extrabold m-0">
                    Kontak dan alamat lahan
                  </h2>

                  <div className="flex flex-col gap-1.5 max-w-[360px]">
                    <label htmlFor="pr-hp" className="text-[15px] font-bold text-[#173b2b]">
                      Nomor HP <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </label>
                    <input
                      id="pr-hp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.nomorHp}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, nomorHp: e.target.value }))
                      }
                      aria-invalid={salahHp}
                      aria-describedby="pr-hp-ket"
                      className={`h-13 px-3.5 border-[1.5px] rounded-xl bg-white text-[#173b2b] text-base outline-none ${
                        salahHp ? 'border-[#b42318]' : 'border-[#dee3da]'
                      }`}
                    />
                    <p id="pr-hp-ket" className="m-0 text-[13px] leading-relaxed text-[#5a6b60]">
                      Hanya dipakai kurir saat penjemputan dan notifikasi penting via WhatsApp.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="m-0 text-[15px] font-bold text-[#173b2b]">
                      Kecamatan lahan
                    </p>
                    <p className="m-0 p-2.5 px-3 rounded-xl bg-[#f6f8f4] text-sm leading-relaxed">
                      <strong>Lembang, Kab. Bandung Barat</strong>
                      <br />
                      <span className="text-[#3f5247]">
                        Dari pendaftaran. Pindah kecamatan perlu verifikasi lahan ulang.
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pr-alamat" className="text-[15px] font-bold text-[#173b2b]">
                      Alamat lahan <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </label>
                    <textarea
                      id="pr-alamat"
                      rows={2}
                      autoComplete="street-address"
                      value={formData.alamatLahan}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, alamatLahan: e.target.value }))
                      }
                      aria-invalid={salahAlamat}
                      placeholder="Kampung, RT/RW, desa"
                      className={`w-full p-3 px-3.5 border-[1.5px] rounded-xl bg-white text-[#173b2b] text-base leading-relaxed outline-none resize-y ${
                        salahAlamat ? 'border-[#b42318]' : 'border-[#dee3da]'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pr-patokan" className="text-[15px] font-bold text-[#173b2b]">
                      Patokan <span className="font-normal text-[#5a6b60]">(opsional)</span>
                    </label>
                    <input
                      id="pr-patokan"
                      type="text"
                      value={formData.patokan ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, patokan: e.target.value }))
                      }
                      placeholder="Contoh: Gerbang kebun hijau setelah tikungan"
                      className="h-13 px-3.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-base outline-none"
                    />
                  </div>

                  {/* Interactive Map Pin Widget */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[15px] font-bold text-[#173b2b]">
                      Titik lahan di peta{' '}
                      <span className="font-normal text-[#5a6b60]">
                        (perlu untuk kurir instan dan ambil di lahan)
                      </span>
                    </span>
                    <div
                      role="img"
                      aria-label="Peta lahan dengan pin terpasang"
                      className="relative h-[150px] border border-[#dee3da] rounded-xl bg-[#e9f1e4] overflow-hidden"
                    >
                      <span className="absolute -left-[10%] top-[62%] w-[120%] h-2.5 bg-white -rotate-6" />
                      <span className="absolute left-[12%] top-[10%] w-[30%] h-[34%] rounded-lg bg-[#c9e2bf]" />
                      <span className="absolute left-[58%] top-[18%] w-[28%] h-[30%] rounded-lg bg-[#c9e2bf]" />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[88%] text-[#064e3b]">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="#d5f6d5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <span className="absolute right-2 bottom-2 px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                        Peta titik lahan
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeserTitik}
                      className="self-start inline-flex items-center min-h-[44px] px-3.5 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-extrabold text-sm cursor-pointer"
                    >
                      Geser titik
                    </button>
                    <p aria-live="polite" className="m-0 text-[13px] text-[#3f5247]">
                      {ketTitik}
                    </p>
                  </div>
                </section>

                <button
                  type="submit"
                  className="min-h-14 rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
                >
                  Simpan profil
                </button>
              </form>

              {/* Aside Preview Column */}
              <aside
                aria-labelledby="judul-lihat-pembeli"
                className="flex-1 basis-[280px] min-w-0 flex flex-col gap-3.5"
              >
                {/* Store Card Preview */}
                <section className="p-[18px] rounded-2xl bg-[#ebf2eb] flex flex-col gap-2.5">
                  <h2 id="judul-lihat-pembeli" className="text-[15px] font-extrabold m-0">
                    Yang dilihat pembeli
                  </h2>
                  <div className="p-3.5 rounded-xl bg-white flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-full grid place-items-center bg-[#064e3b] text-white font-extrabold text-sm">
                        {initials || 'KT'}
                      </span>
                      <div>
                        <strong className="block text-sm font-extrabold text-[#173b2b]">
                          {formData.namaToko || 'Nama Toko'}
                        </strong>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#157a4c]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Terverifikasi · Lembang
                        </span>
                      </div>
                    </div>
                    <p className="m-0 text-xs leading-relaxed text-[#3f5247]">
                      {formData.deskripsiToko || 'Cerita tentang kebun belum diisi.'}
                    </p>
                  </div>
                </section>

                {/* Privacy Card */}
                <section className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2 text-[13px] leading-relaxed text-[#3f5247]">
                  <h2 className="text-sm font-extrabold text-[#173b2b] m-0">
                    Siapa melihat apa
                  </h2>
                  <ul className="list-disc pl-4 m-0 flex flex-col gap-1">
                    <li>
                      <strong>Pembeli umum:</strong> hanya melihat nama toko, kecamatan, dan deskripsi.
                    </li>
                    <li>
                      <strong>Kurir & pembeli dengan pesanan:</strong> melihat nomor HP dan alamat lengkap untuk pengiriman.
                    </li>
                  </ul>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="min-[900px]:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}
