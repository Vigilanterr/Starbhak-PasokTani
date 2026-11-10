'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';
import { UnggahFoto } from '../../common';
import type { ProdukTokoDetailData } from './TokoProdukDetail';

export interface TokoProdukUbahProps {
  produkId: string;
  produk?: ProdukTokoDetailData;
  namaAwal?: string;
  kategoriAwal?: string;
  satuanAwal?: string;
  deskripsiAwal?: string;
  hargaAwal?: number;
  fotoUrlsAwal?: string[];
  tingkatGrosirAwal?: { min: string; harga: string }[];
  tampilAwal?: boolean;
  stokAktifKg?: number;
  pesananAktifCount?: number;
  onSimpan?: (produkId: string, data: unknown) => void;
  onToggleTampil?: (tampil: boolean) => void;
  onHapusProduk?: () => void;
  className?: string;
}

export function TokoProdukUbah({
  produkId,
  produk,
  namaAwal = 'Kol Bulat Lembang',
  kategoriAwal = 'Sayuran',
  satuanAwal = 'kg',
  deskripsiAwal = 'Kol segar langsung dari kebun Lembang.',
  hargaAwal = 9000,
  tingkatGrosirAwal,
  tampilAwal = true,
  stokAktifKg = 8,
  pesananAktifCount = 3,
  onSimpan,
  onToggleTampil,
  onHapusProduk,
  className = '',
}: TokoProdukUbahProps) {
  // Use produk prop if provided, else fallback to props or defaults
  const [nama, setNama] = useState(produk?.nama ?? namaAwal);
  const [kategori, setKategori] = useState(produk?.kategori ?? kategoriAwal);
  const [deskripsi, setDeskripsi] = useState(produk?.deskripsi ?? deskripsiAwal);
  const [harga, setHarga] = useState(String(produk?.harga ?? hargaAwal));
  const [tampil, setTampil] = useState<boolean>(produk?.tampil ?? tampilAwal);
  const [fotoUtamaStatus, setFotoUtamaStatus] = useState<'kosong' | 'siap' | 'buram'>('siap');

  const [grosirTingkat, setGrosirTingkat] = useState<{ id: string; min: string; harga: string }[]>(
    tingkatGrosirAwal
      ? tingkatGrosirAwal.map((t, idx) => ({ id: `t${idx}`, min: t.min, harga: t.harga }))
      : [
          { id: 't1', min: '10', harga: '8.000' },
          { id: 't2', min: '20', harga: '7.000' },
        ]
  );

  const [tersimpan, setTersimpan] = useState(false);
  const [daftarUbah, setDaftarUbah] = useState<string[]>([]);
  const [galatList, setGalatList] = useState<string[]>([]);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  const cleanPrice = parseInt(harga.replace(/\D/g, ''), 10) || 0;
  const currentStok = produk?.stokTotal ?? stokAktifKg;
  const cannotDelete = currentStok > 0 || pesananAktifCount > 0;

  const handleToggle = () => {
    const nextVal = !tampil;
    setTampil(nextVal);
    if (onToggleTampil) onToggleTampil(nextVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (!nama.trim()) errs.push('Nama produk tidak boleh kosong.');
    if (cleanPrice < 500) errs.push('Harga minimal Rp 500.');

    if (errs.length > 0) {
      setGalatList(errs);
      return;
    }

    setGalatList([]);
    const changes: string[] = [];
    if (nama !== (produk?.nama ?? namaAwal)) changes.push(`Nama diubah menjadi "${nama}".`);
    if (cleanPrice !== (produk?.harga ?? hargaAwal)) changes.push(`Harga diubah menjadi Rp ${cleanPrice.toLocaleString('id-ID')}.`);
    if (kategori !== (produk?.kategori ?? kategoriAwal)) changes.push(`Kategori diubah menjadi ${kategori}.`);
    if (changes.length === 0) changes.push('Data produk diperbarui.');

    setDaftarUbah(changes);
    setTersimpan(true);

    if (onSimpan) {
      onSimpan(produkId, {
        nama,
        kategori,
        deskripsi,
        harga: cleanPrice,
        tampil,
        grosir: grosirTingkat,
      });
    }
  };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1040px]">
          <div className="flex flex-col gap-4">
            <Link
              href={`/toko/produk/${produkId}`}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {nama}
            </Link>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Ubah produk
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#3f5247]">
                Stok diatur terpisah di{' '}
                <Link href={`/toko/produk/${produkId}/stok`} className="text-[#157a4c] font-bold underline">
                  Batch stok
                </Link>
                .
              </p>
            </div>

            {/* Success Status */}
            {tersimpan && (
              <div role="status" className="p-4 border-[1.5px] border-[#064e3b] rounded-xl bg-[#f3faf3] flex flex-col gap-1.5">
                <p className="font-extrabold text-sm sm:text-base text-[#173b2b] flex items-center gap-2">
                  <span className="text-[#157a4c] font-bold">✓</span>
                  Perubahan disimpan
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#3f5247]">
                  {daftarUbah.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
                <Link
                  href={`/toko/produk/${produkId}`}
                  className="self-start text-xs sm:text-sm font-bold text-[#157a4c] hover:underline mt-1"
                >
                  Kembali ke ringkasan produk →
                </Link>
              </div>
            )}

            {/* Validation Errors */}
            {galatList.length > 0 && (
              <div role="alert" className="p-4 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea]">
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#8a1c12]">
                  {galatList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start gap-5">
              <form onSubmit={handleSubmit} className="w-full lg:flex-[999_1_460px] min-w-0 flex flex-col gap-4">
                {/* Info Produk Section */}
                <section aria-labelledby="judul-info" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3.5">
                  <h2 id="judul-info" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Info produk
                  </h2>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="pu-nama" className="text-xs sm:text-sm font-bold text-[#173b2b]">
                      Nama produk <span className="text-[#b42318]">*</span>
                    </label>
                    <input
                      id="pu-nama"
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="h-11 px-3.5 rounded-xl border border-[#7d877e] bg-white text-sm sm:text-base text-[#173b2b]"
                    />
                  </div>

                  <fieldset className="border-0 p-0 m-0 flex flex-col gap-1.5">
                    <legend className="text-xs sm:text-sm font-bold text-[#173b2b]">
                      Kategori <span className="text-[#b42318]">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {['Sayuran', 'Buah', 'Umbi', 'Rempah dan bumbu', 'Lainnya'].map((kat) => (
                        <label
                          key={kat}
                          className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-full text-xs sm:text-sm font-bold border cursor-pointer ${
                            kategori.toLowerCase() === kat.toLowerCase()
                              ? 'bg-[#ebf2eb] border-[#064e3b] text-[#064e3b]'
                              : 'bg-white border-[#dee3da] text-[#173b2b]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pu-kategori"
                            checked={kategori.toLowerCase() === kat.toLowerCase()}
                            onChange={() => setKategori(kat)}
                            className="w-4 h-4 accent-[#064e3b]"
                          />
                          {kat}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Unit Locking Guard */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs sm:text-sm font-bold text-[#173b2b]">Dijual per</p>
                    <p className="p-3 rounded-xl bg-[#f6f8f4] text-xs sm:text-sm text-[#3f5247] flex items-start gap-2">
                      <span className="font-bold text-[#173b2b]">🔒</span>
                      <span>
                        <strong>{satuanAwal}</strong>. Satuan terkunci selama masih ada stok atau pesanan aktif, agar jumlah di pesanan tidak berubah arti.
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="pu-desk" className="text-xs sm:text-sm font-bold text-[#173b2b]">
                      Keterangan (opsional)
                    </label>
                    <textarea
                      id="pu-desk"
                      rows={3}
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      className="p-3 rounded-xl border border-[#7d877e] bg-white text-xs sm:text-sm text-[#173b2b] resize-y"
                    />
                  </div>
                </section>

                {/* Foto Section */}
                <section aria-labelledby="judul-foto" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                  <h2 id="judul-foto" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Foto produk
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:w-[240px] shrink-0">
                      <UnggahFoto
                        label="Foto utama"
                        status={fotoUtamaStatus}
                        onPilih={() => setFotoUtamaStatus('siap')}
                        onUlang={() => setFotoUtamaStatus('siap')}
                        onHapus={() => setFotoUtamaStatus('kosong')}
                      />
                    </div>
                  </div>
                </section>

                {/* Harga Section */}
                <section aria-labelledby="judul-harga" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                  <h2 id="judul-harga" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Harga
                  </h2>
                  <div className="flex flex-col gap-1 max-w-[320px]">
                    <label htmlFor="pu-harga" className="text-xs sm:text-sm font-bold text-[#173b2b]">
                      Harga per {satuanAwal} <span className="text-[#b42318]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#5a6b60]">Rp</span>
                      <input
                        id="pu-harga"
                        type="text"
                        inputMode="numeric"
                        value={harga}
                        onChange={(e) => setHarga(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#7d877e] bg-white text-base font-extrabold text-[#173b2b]"
                      />
                    </div>
                  </div>

                  <p className="p-2.5 rounded-xl bg-[#f6f8f4] text-xs text-[#3f5247]">
                    Harga baru berlaku untuk pesanan berikutnya. Pesanan yang sudah dibayar tetap memakai harga lama.
                  </p>

                  {/* Wholesale Tiers */}
                  <div className="pt-3 border-t border-[#eef0eb] flex flex-col gap-2">
                    <p className="text-xs sm:text-sm font-extrabold text-[#173b2b]">Harga grosir</p>
                    {grosirTingkat.map((t, i) => (
                      <div key={t.id} className="p-2.5 rounded-xl border border-[#dee3da] flex items-center justify-between gap-2 bg-[#fcfbf6]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#ebf2eb] text-[#064e3b] text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-xs text-[#173b2b]">Mulai {t.min} {satuanAwal}: <strong>Rp {t.harga}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGrosirTingkat((prev) => prev.filter((item) => item.id !== t.id))}
                          className="text-xs text-[#b42318] hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                    <Link
                      href={`/toko/produk/${produkId}/harga-grosir`}
                      className="self-start text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
                    >
                      Buka halaman Harga grosir untuk mengatur lebih lanjut →
                    </Link>
                  </div>
                </section>

                {/* Sembunyikan atau Hapus Section */}
                <section aria-labelledby="judul-kelola" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                  <h2 id="judul-kelola" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Visibilitas dan hapus
                  </h2>

                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#f6f8f4]">
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-[#173b2b]">
                        Tampilkan di toko
                      </p>
                      <p className="text-xs text-[#3f5247]">
                        Saat disembunyikan, pembeli tidak dapat melihat atau memesan produk ini.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tampil}
                      onClick={handleToggle}
                      className="w-12 h-8 flex items-center bg-transparent cursor-pointer"
                    >
                      <span className={`relative block w-10 h-6 rounded-full ${tampil ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${tampil ? 'left-4.5' : 'left-0.5'}`} />
                      </span>
                    </button>
                  </div>

                  {/* Delete Button Guard */}
                  <div className="pt-2 border-t border-[#f0f2ed]">
                    {cannotDelete ? (
                      <p className="text-xs text-[#b42318] p-3 rounded-xl bg-[#fdecea] leading-relaxed">
                        <strong>Belum bisa dihapus:</strong> masih ada {currentStok} {satuanAwal} stok dan {pesananAktifCount} pesanan aktif yang belum dikirim. Tarik stok dulu atau tunggu pesanan selesai.
                      </p>
                    ) : (
                      <div>
                        {!konfirmasiHapus ? (
                          <button
                            type="button"
                            onClick={() => setKonfirmasiHapus(true)}
                            className="min-h-[40px] px-3.5 rounded-xl border border-[#f2b8b2] text-xs sm:text-sm font-extrabold text-[#b42318] hover:bg-[#fdecea]"
                          >
                            Hapus produk
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-[#fdecea] flex flex-col gap-2">
                            <p className="text-xs font-bold text-[#8a1c12]">
                              Apakah kamu yakin ingin menghapus produk ini secara permanen?
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onHapusProduk) onHapusProduk();
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#b42318] text-white text-xs font-bold"
                              >
                                Ya, hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setKonfirmasiHapus(false)}
                                className="px-3 py-1.5 rounded-lg border border-[#f2b8b2] bg-white text-xs font-bold"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <button
                  type="submit"
                  className="min-h-[50px] rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
                >
                  Simpan perubahan
                </button>
              </form>

              {/* Right Column: Live Buyer Preview */}
              <aside
                aria-labelledby="judul-pratinjau"
                className="w-full lg:w-[280px] shrink-0 p-4 rounded-2xl bg-[#ebf2eb] flex flex-col gap-2.5"
              >
                <h2 id="judul-pratinjau" className="text-sm font-extrabold text-[#173b2b]">
                  Yang dilihat pembeli
                </h2>
                <div className="p-3 rounded-xl bg-white flex flex-col gap-2">
                  <div className="w-full aspect-4/3 rounded-lg bg-[#e3f1df] flex items-center justify-center text-[#2f7a3e]">
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-[#173b2b]">
                      {nama}
                    </p>
                    <p className="text-xs text-[#3f5247]">
                      <strong>Rp {cleanPrice.toLocaleString('id-ID')}</strong>/{satuanAwal}
                    </p>
                    <p className="text-[11px] text-[#157a4c] font-bold mt-1">
                      Kebun Mang Ujang · Lembang
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="produk" />
      </div>
    </div>
  );
}

export default TokoProdukUbah;
