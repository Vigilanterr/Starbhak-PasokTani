'use client';

import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { ChipStatus } from '../common/ChipStatus';
import { JalurKomplain } from '../common/JalurKomplain';

export interface DataBuktiKomplain {
  produkRingkas: string;
  masalahLabel: string;
  solusiDiminta: string;
  cerita: string;
  fotoBukti: string[];
}

export interface DataKomplainDetail {
  id: string;
  pesananId: string;
  noPesanan: string;
  toko: string;
  tahap: 'diajukan' | 'ditanggapi' | 'dimediasi' | 'selesai';
  tanggalPengajuan: string;
  batasWaktuTanggapan?: string;
  masalah: string;
  deskripsi: string;
  tuntutan: string;
  nominalTuntutan?: number;
  fotoBukti: string[];
  tanggapanPetani?: {
    tanggal: string;
    isi: string;
    solusiTawaran: string;
    nominalTawaran?: number;
  };
}

export interface KomplainDiajukanProps {
  komplain?: DataKomplainDetail;
  className?: string;
}

const DEFAULT_KOMPLAIN_DIAJUKAN: DataKomplainDetail = {
  id: 'KOMP-26110801',
  pesananId: 'PT-26110418',
  noPesanan: 'PT-26110418',
  toko: 'Kebun Mang Ujang',
  tahap: 'diajukan',
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
};

export function KomplainDiajukan({
  komplain = DEFAULT_KOMPLAIN_DIAJUKAN,
  className = '',
}: KomplainDiajukanProps) {
  const formatRp = (n?: number) =>
    n ? 'Rp ' + n.toLocaleString('id-ID') : 'Rp 32.000';

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
            {/* Status Hero Banner */}
            <section
              aria-labelledby="judul-status"
              className="p-5 border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col gap-3"
            >
              <ChipStatus status="komplain-diajukan" />
              <div>
                <h1
                  id="judul-status"
                  className="m-0 text-xl md:text-2xl font-extrabold tracking-tight leading-snug"
                >
                  Komplain terkirim. Menunggu tanggapan petani
                </h1>
                <p className="mt-2 mb-0 text-sm md:text-[15px] leading-relaxed text-[#3f5247]">
                  {komplain.toko} memiliki batas waktu 24 jam untuk menanggapi komplain ini (sampai {komplain.batasWaktuTanggapan}). Seluruh dana transaksi sebesar {formatRp(komplain.nominalTuntutan)} tetap ditahan aman di escrow Pasok Tani.
                </p>
              </div>
            </section>

            {/* Dispute Progress Timeline */}
            <section
              aria-labelledby="judul-jalur"
              className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <h2
                id="judul-jalur"
                className="m-0 text-base font-extrabold text-[#173b2b]"
              >
                Perkembangan komplain
              </h2>
              <JalurKomplain tahap="diajukan" />
            </section>

            {/* Recap Komplainmu */}
            <section
              aria-labelledby="judul-rekap"
              className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3.5"
            >
              <h2
                id="judul-rekap"
                className="m-0 text-base font-extrabold text-[#173b2b]"
              >
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

              {/* Photo Proof Gallery */}
              {komplain.fotoBukti && komplain.fotoBukti.length > 0 && (
                <div>
                  <p className="m-0 mb-2 text-xs font-bold text-[#5a6b60]">
                    Bukti foto yang dilampirkan:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {komplain.fotoBukti.map((foto, idx) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={idx}
                        src={foto}
                        alt={`Bukti komplain ${idx + 1}`}
                        className="w-18 h-18 rounded-xl object-cover border border-[#dee3da]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside
            aria-label="Info dana dan bantuan"
            className="flex-[1_1_320px] min-w-0 flex flex-col gap-4"
          >
            {/* Escrow Status Card */}
            <section
              aria-labelledby="judul-dana"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h2 id="judul-dana" className="m-0 text-xs font-bold text-[#5a6b60]">
                  Dana pesanan
                </h2>
                <ChipStatus status="dana-ditahan" />
              </div>
              <p className="m-0 text-xs leading-relaxed text-[#3f5247]">
                Dana tetap aman di escrow Pasok Tani. Selama komplain diproses, dana tidak diteruskan otomatis ke petani sampai ada keputusan bersama atau mediasi admin.
              </p>
            </section>

            {/* Help Navigation */}
            <section
              aria-labelledby="judul-bantuan"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5 text-xs"
            >
              <h2 id="judul-bantuan" className="m-0 text-xs font-bold text-[#5a6b60]">
                Bantuan & Informasi
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
                Lihat detail pesanan
              </Link>
              <Link
                href="/bantuan"
                className="font-bold text-[#064e3b] no-underline hover:underline"
              >
                Pusat Bantuan Pasok Tani
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default KomplainDiajukan;
