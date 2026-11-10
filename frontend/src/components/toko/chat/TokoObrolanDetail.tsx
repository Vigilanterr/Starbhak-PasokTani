'use client';

import React from 'react';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { DaftarObrolan } from '../../chat/DaftarObrolan';
import { Percakapan } from '../../chat/Percakapan';
import type { KeadaanKoneksi, PesanChat } from '../../chat/types';

export interface PesanObrolanItem {
  id: string;
  pengirim: 'petani' | 'pembeli';
  teks: string;
  waktu: string;
  statusKirim?: 'terkirim' | 'dibaca';
}

export interface PercakapanTokoData {
  id: string;
  namaLawan: string;
  fotoLawan?: string;
  noPesanan?: string;
  pesanList: PesanObrolanItem[];
}

export interface TokoObrolanDetailProps {
  percakapanId: string;
  percakapan?: PercakapanTokoData;
  keadaan?: KeadaanKoneksi | string;
  sheet?: boolean;
  onKirimPesan?: (percakapanId: string, teks: string) => void;
  className?: string;
}

const DEFAULT_PERCAKAPAN: PercakapanTokoData = {
  id: 'dewi',
  namaLawan: 'Warung Dewi',
  noPesanan: 'PT-26110418',
  pesanList: [
    {
      id: 'p1',
      pengirim: 'pembeli',
      teks: 'Pak Ujang, tomat yang 12 kg kemarin masih ada stok untuk besok?',
      waktu: '11.08',
      statusKirim: 'dibaca',
    },
    {
      id: 'p2',
      pengirim: 'petani',
      teks: 'Ada Bu Dewi, baru panen tadi pagi masih segar semua.',
      waktu: '11.10',
      statusKirim: 'terkirim',
    },
  ],
};

export function TokoObrolanDetail({
  percakapanId = 'dewi',
  percakapan = DEFAULT_PERCAKAPAN,
  keadaan = 'normal',
  sheet = false,
  onKirimPesan,
  className = '',
}: TokoObrolanDetailProps) {
  const currentPercakapan = percakapan?.id === percakapanId ? percakapan : {
    ...DEFAULT_PERCAKAPAN,
    id: percakapanId,
    namaLawan: percakapan?.namaLawan ?? DEFAULT_PERCAKAPAN.namaLawan,
  };

  const resolvedKeadaan = (keadaan === 'gagal' || keadaan === 'putus') ? keadaan : 'normal';

  // Map messages to PesanChat type if provided
  const customPesanList: PesanChat[] | undefined = currentPercakapan.pesanList?.map((p) => ({
    id: p.id,
    jenis: 'teks',
    dari: p.pengirim === 'petani' ? 'saya' : 'lawan',
    teks: p.teks,
    waktu: p.waktu,
    status: p.statusKirim === 'dibaca' ? 'dibaca' : 'terkirim',
  }));

  const handleKirim = (teks: string) => {
    if (onKirimPesan) {
      onKirimPesan(percakapanId, teks);
    }
  };

  return (
    <div className={`relative min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      {/* Desktop View (>= 900px) */}
      <div className="hidden min-[900px]:block">
        <TokoAtas notif={5} obrolan={2} sempit={false} />
        <div className="flex items-start">
          <div className="w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
            <TokoSamping aktif="obrolan" />
          </div>
          <main className="flex-1 min-w-0 p-5 px-6 pb-12">
            <div className="max-w-[1100px] flex flex-col gap-4">
              <h1 className="text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Obrolan
              </h1>
              <div className="flex items-start gap-5">
                {/* Left 340px Inbox Column */}
                <div className="w-[340px] shrink-0 min-w-0">
                  <DaftarObrolan
                    peran="petani"
                    aktif={percakapanId}
                    sempit={false}
                  />
                </div>

                {/* Right Chat Column */}
                <div className="flex-1 min-w-0">
                  <Percakapan
                    peran="petani"
                    keadaan={resolvedKeadaan}
                    sheet={sheet}
                    sempit={false}
                    lawanNama={currentPercakapan.namaLawan}
                    lawanSub={currentPercakapan.noPesanan ? `Pesanan ${currentPercakapan.noPesanan}` : undefined}
                    pesanList={customPesanList}
                    onKirim={handleKirim}
                    hrefKembali="/toko/obrolan"
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile View (< 900px) */}
      <div className="min-[900px]:hidden min-h-screen flex flex-col">
        <Percakapan
          peran="petani"
          keadaan={resolvedKeadaan}
          sheet={sheet}
          sempit={true}
          lawanNama={currentPercakapan.namaLawan}
          lawanSub={currentPercakapan.noPesanan ? `Pesanan ${currentPercakapan.noPesanan}` : undefined}
          pesanList={customPesanList}
          onKirim={handleKirim}
          hrefKembali="/toko/obrolan"
        />
      </div>
    </div>
  );
}
