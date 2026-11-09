'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { ChipStatus } from '../common/ChipStatus';
import { JalurKomplain } from '../common/JalurKomplain';
import type { DataKomplainDetail } from './KomplainDiajukan';

export interface TawaranPetani {
  namaToko: string;
  waktuTanggapan: string;
  pesanPetani: string;
  solusiDimintaBuyer: string;
  solusiDitawarkanPetani: string;
  nominalPengembalian: number;
  sisaDiteruskanPetani: number;
}

export interface KomplainDitanggapiProps {
  komplain?: DataKomplainDetail;
  onTerimaSolusi?: (komplainId: string) => void;
  onAjukanMediasi?: (komplainId: string, alasan: string) => void;
  className?: string;
}

const DEFAULT_KOMPLAIN_DITANGGAPI: DataKomplainDetail = {
  id: 'KOMP-26110801',
  pesananId: 'PT-26110418',
  noPesanan: 'PT-26110418',
  toko: 'Kebun Mang Ujang',
  tahap: 'ditanggapi',
  tanggalPengajuan: 'Min, 8 Nov 2026, 11.30 WIB',
  batasWaktuTanggapan: 'Sen, 9 Nov 2026, 11.30 WIB',
  masalah: 'Layu, busuk, atau tidak segar',
  deskripsi: 'Bagian luar kol layu dan agak berair saat paket kardus dibuka.',
  tuntutan: 'Kembalikan sebagian dana (Rp 32.000)',
  nominalTuntutan: 32000,
  fotoBukti: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1597362070388-75b22256df2e?auto=format&fit=crop&w=300&q=80',
  ],
  tanggapanPetani: {
    tanggal: 'Sen, 9 Nov, 13.05 WIB',
    isi: 'Mohon maaf Bu Dewi, sayur kol memang sempat tertahan di gudang transit saat hujan deras. Saya setujui ganti rugi Rp 32.000 untuk 4 kg yang layu, langsung masuk ke Dompet ibu.',
    solusiTawaran: 'Rp 32.000 ke Dompet',
    nominalTawaran: 32000,
  },
};

export function KomplainDitanggapi({
  komplain = DEFAULT_KOMPLAIN_DITANGGAPI,
  onTerimaSolusi,
  onAjukanMediasi,
  className = '',
}: KomplainDitanggapiProps) {
  const [tahapStatus, setTahapStatus] = useState<'ditanggapi' | 'dimediasi' | 'selesai'>(
    komplain.tahap === 'dimediasi' || komplain.tahap === 'selesai'
      ? komplain.tahap
      : 'ditanggapi'
  );
  const [tanyaKonfirmasi, setTanyaKonfirmasi] = useState(false);
  const [tanyaMediasi, setTanyaMediasi] = useState(false);
  const [alasanMediasi, setAlasanMediasi] = useState('');
  const [pesanToast, setPesanToast] = useState('');

  const formatRp = (n?: number) =>
    n ? 'Rp ' + n.toLocaleString('id-ID') : 'Rp 32.000';

  const handleTerima = () => {
    onTerimaSolusi?.(komplain.id);
    setTahapStatus('selesai');
    setTanyaKonfirmasi(false);
    setPesanToast('Tawaran diterima. Pengembalian dana segera masuk ke saldo Dompet.');
  };

  const handleMediasi = () => {
    onAjukanMediasi?.(komplain.id, alasanMediasi);
    setTahapStatus('dimediasi');
    setTanyaMediasi(false);
    setPesanToast('Permohonan mediasi admin telah berhasil dikirimkan.');
  };

  return (
    <div className={`min-h-full bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}>
      <SiteHeader signedIn={true} cartCount={0} />

      <main className="max-w-[1100px] mx-auto px-4 py-4 md:py-6 md:px-6 md:pb-16 box-border">
        {/* Breadcrumb */}
        <nav aria-label="Remah roti" className="text-[13px] text-[#5a6b60] mb-2.5">
          <Link
            href={`/pesanan/${komplain.pesananId}`}
            className="inline-flex items-center gap-1 min-h-8 text-[#157a4c] font-bold no-underline hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Pesanan {komplain.noPesanan}
          </Link>
        </nav>

        <div className="flex flex-wrap items-start gap-6">
          {/* Main Column */}
          <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-4">
            {/* Status Header Banner */}
            <section className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
              <ChipStatus
                status={
                  tahapStatus === 'ditanggapi'
                    ? 'komplain-ditanggapi'
                    : tahapStatus === 'dimediasi'
                    ? 'komplain-dimediasi'
                    : 'selesai'
                }
              />
              <div>
                <h1 className="m-0 text-xl md:text-2xl font-extrabold tracking-tight leading-snug">
                  {tahapStatus === 'ditanggapi' && 'Petani menawarkan penyelesaian'}
                  {tahapStatus === 'dimediasi' && 'Admin sedang meninjau komplain'}
                  {tahapStatus === 'selesai' && 'Komplain selesai disepakati'}
                </h1>
                <p className="mt-2 mb-0 text-sm md:text-[15px] leading-relaxed text-[#3f5247]">
                  {tahapStatus === 'ditanggapi' &&
                    'Petani telah merespons dan mengajukan solusi penyesuaian dana. Terima tawaran ini, atau ajukan mediasi ke admin Pasok Tani jika belum sesuai.'}
                  {tahapStatus === 'dimediasi' &&
                    'Admin Pasok Tani sedang meninjau bukti transaksi dan pesan kedua pihak secara objektif. Keputusan admin bersifat mengikat.'}
                  {tahapStatus === 'selesai' &&
                    'Penyelesaian telah disepakati. Dana penyesuaian telah dikembalikan ke saldo Dompet kamu.'}
                </p>
              </div>

              {pesanToast && (
                <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                  {pesanToast}
                </p>
              )}
            </section>

            {/* Farmer Offer Card */}
            {tahapStatus === 'ditanggapi' && (
              <section
                aria-labelledby="judul-tawaran"
                className="p-5 border-[1.5px] border-[#064e3b] rounded-2xl bg-[#f3faf3] flex flex-col gap-3.5"
              >
                <h2 id="judul-tawaran" className="m-0 text-base font-extrabold text-[#173b2b]">
                  Tanggapan {komplain.toko} · {komplain.tanggapanPetani?.tanggal ?? 'Hari ini'}
                </h2>

                <blockquote className="m-0 p-3.5 rounded-xl bg-white border border-[#a9cfae] text-sm leading-relaxed text-[#173b2b] italic">
                  “{komplain.tanggapanPetani?.isi}”
                </blockquote>

                <dl className="m-0 flex flex-col gap-2 text-xs md:text-sm">
                  <div className="flex justify-between border-b border-[#a9cfae]/40 pb-1.5">
                    <dt className="text-[#5a6b60]">Yang kamu minta:</dt>
                    <dd className="m-0 font-bold text-[#173b2b]">{komplain.tuntutan}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#a9cfae]/40 pb-1.5">
                    <dt className="text-[#5a6b60]">Yang ditawarkan petani:</dt>
                    <dd className="m-0 font-extrabold text-[#064e3b]">
                      {komplain.tanggapanPetani?.solusiTawaran}
                    </dd>
                  </div>
                </dl>

                {/* Inline Confirmation Box (Accept) */}
                {tanyaKonfirmasi && (
                  <div
                    role="group"
                    aria-label="Konfirmasi terima tawaran"
                    className="p-4 rounded-xl bg-white border border-[#a9cfae] flex flex-col gap-2.5"
                  >
                    <p className="m-0 text-xs md:text-sm leading-relaxed text-[#173b2b]">
                      <strong>Terima dan tutup komplain?</strong> Dana {formatRp(komplain.tanggapanPetani?.nominalTawaran)} akan masuk ke saldo Dompet sekarang, dan sisa pembayaran diteruskan ke {komplain.toko}. Komplain ini tidak dapat dibuka kembali.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTerima}
                        className="min-h-11 px-4 rounded-xl border-0 bg-[#064e3b] text-white text-xs md:text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                      >
                        Ya, terima {formatRp(komplain.tanggapanPetani?.nominalTawaran)}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTanyaKonfirmasi(false)}
                        className="min-h-11 px-3.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-xs md:text-sm font-bold cursor-pointer hover:bg-[#f6f8f5]"
                      >
                        Pikir dulu
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Prompt Box (Mediation) */}
                {tanyaMediasi && (
                  <div
                    role="group"
                    aria-label="Permohonan mediasi admin"
                    className="p-4 rounded-xl bg-white border border-[#075985] flex flex-col gap-2.5"
                  >
                    <p className="m-0 text-xs md:text-sm leading-relaxed text-[#173b2b]">
                      <strong>Minta peninjauan admin Pasok Tani:</strong> Jelaskan mengapa tawaran petani belum memuaskan. Admin akan meninjau bukti foto dan keputusan admin bersifat final.
                    </p>
                    <textarea
                      rows={2}
                      value={alasanMediasi}
                      onChange={(e) => setAlasanMediasi(e.target.value)}
                      placeholder="Tulis alasan singkat untuk tim mediasi admin..."
                      className="w-full p-2.5 rounded-lg border border-[#c9d2c6] text-xs md:text-sm text-[#173b2b] focus:outline-none focus:ring-2 focus:ring-[#075985]"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleMediasi}
                        className="min-h-11 px-4 rounded-xl border-0 bg-[#075985] text-white text-xs md:text-sm font-extrabold cursor-pointer hover:bg-[#0369a1]"
                      >
                        Kirim ke admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setTanyaMediasi(false)}
                        className="min-h-11 px-3.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-xs md:text-sm font-bold cursor-pointer hover:bg-[#f6f8f5]"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Initial Action Buttons */}
                {!tanyaKonfirmasi && !tanyaMediasi && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTanyaKonfirmasi(true)}
                      className="flex-1 min-h-12 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                    >
                      Terima {formatRp(komplain.tanggapanPetani?.nominalTawaran)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTanyaMediasi(true)}
                      className="flex-1 min-h-12 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold cursor-pointer hover:bg-[#ebf2eb]"
                    >
                      Minta mediasi admin
                    </button>
                  </div>
                )}

                <p className="m-0 text-xs text-[#5a6b60]">
                  Mediasi: admin memeriksa rekam jejak, foto barang saat tiba, dan keterangan kedua pihak secara adil.
                </p>
              </section>
            )}

            {/* Dispute Timeline */}
            <section
              aria-labelledby="judul-jalur"
              className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <h2 id="judul-jalur" className="m-0 text-base font-extrabold text-[#173b2b]">
                Perkembangan komplain
              </h2>
              <JalurKomplain
                tahap={tahapStatus}
                lewatMediasi={tahapStatus === 'dimediasi' || komplain.tahap === 'dimediasi'}
              />
            </section>

            {/* Recap Komplainmu */}
            <section
              aria-labelledby="judul-rekap"
              className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <h2 id="judul-rekap" className="m-0 text-base font-extrabold text-[#173b2b]">
                Komplainmu
              </h2>

              <dl className="m-0 flex flex-col gap-2 text-xs md:text-sm">
                <div className="flex justify-between border-b border-[#eef0eb] pb-2">
                  <dt className="text-[#5a6b60]">Masalah:</dt>
                  <dd className="m-0 font-bold text-[#173b2b]">{komplain.masalah}</dd>
                </div>
                <div className="flex justify-between border-b border-[#eef0eb] pb-2">
                  <dt className="text-[#5a6b60]">Solusi diminta:</dt>
                  <dd className="m-0 font-bold text-[#173b2b]">{komplain.tuntutan}</dd>
                </div>
              </dl>

              <blockquote className="m-0 p-3 rounded-xl bg-[#fcfbf6] border border-[#eef0eb] text-sm leading-relaxed text-[#3f5247] italic">
                “{komplain.deskripsi}”
              </blockquote>

              {komplain.fotoBukti && komplain.fotoBukti.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {komplain.fotoBukti.map((foto, idx) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={idx}
                      src={foto}
                      alt={`Bukti komplain ${idx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-[#dee3da]"
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside
            aria-label="Info dana pesanan"
            className="flex-[1_1_320px] min-w-0 flex flex-col gap-4"
          >
            {/* Escrow redistribution card */}
            <section
              aria-labelledby="judul-dana"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <h2 id="judul-dana" className="m-0 text-xs font-bold text-[#5a6b60]">
                  Dana pesanan
                </h2>
                <ChipStatus
                  status={tahapStatus === 'selesai' ? 'dana-diteruskan' : 'dana-ditahan'}
                />
              </div>

              <dl className="m-0 flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between">
                  <dt className="text-[#5a6b60]">Total produk ditahan:</dt>
                  <dd className="m-0 font-medium text-[#173b2b]">Rp 272.000</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5a6b60]">Kembali ke Dompet:</dt>
                  <dd className="m-0 font-bold text-[#064e3b]">
                    {formatRp(komplain.tanggapanPetani?.nominalTawaran)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#eef0eb]">
                  <dt className="text-[#5a6b60]">Diteruskan ke petani:</dt>
                  <dd className="m-0 font-bold text-[#173b2b]">
                    {formatRp(272000 - (komplain.tanggapanPetani?.nominalTawaran ?? 32000))}
                  </dd>
                </div>
              </dl>

              <p className="mt-1 mb-0 text-[11px] leading-relaxed text-[#5a6b60]">
                Pengembalian dana diproses ke saldo Dompet Pasok Tani secara instan tanpa potongan biaya.
              </p>
            </section>

            {/* Assistance Card */}
            <section
              aria-labelledby="judul-bantuan"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2 text-xs"
            >
              <h2 id="judul-bantuan" className="m-0 text-xs font-bold text-[#5a6b60]">
                Bantuan
              </h2>
              <Link
                href="/obrolan"
                className="font-bold text-[#064e3b] no-underline hover:underline"
              >
                Buka obrolan dengan petani
              </Link>
              <Link
                href={`/pesanan/${komplain.pesananId}`}
                className="font-bold text-[#064e3b] no-underline hover:underline"
              >
                Detail pesanan
              </Link>
              <Link
                href="/bantuan"
                className="font-bold text-[#064e3b] no-underline hover:underline"
              >
                Pusat Bantuan
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default KomplainDitanggapi;
