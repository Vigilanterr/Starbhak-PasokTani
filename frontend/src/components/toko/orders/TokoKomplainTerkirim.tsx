'use client';

import React from 'react';
import { TokoKomplain, type KomplainTokoItem } from './TokoKomplain';

export interface TokoKomplainTerkirimProps {
  pesananId?: string;
  pesanKonfirmasi?: string;
  estimasiSelesai?: string;
  komplainList?: KomplainTokoItem[];
  className?: string;
}

export function TokoKomplainTerkirim({
  pesananId,
  pesanKonfirmasi,
  estimasiSelesai,
  komplainList,
  className = '',
}: TokoKomplainTerkirimProps) {
  // If specific pesananId is passed, we can customize the preset data if needed
  const listToPass = komplainList ?? (pesananId ? [{
    id: 'KMP-TERKIRIM',
    pesananId: pesananId,
    nomorPesanan: pesananId,
    namaPembeli: 'Dewi Lestari',
    tanggalKomplain: 'Sen, 9 Nov, 09.31',
    produk: 'Kol Bulat Lembang, 4 dari 16 kg',
    alasan: 'Layu atau busuk',
    deskripsi: 'Bagian luar kol layu dan berlendir, kira-kira 4 kg dari 16 kg.',
    fotoBukti: [
      { id: 'f1', label: 'Kol layu di kardus (tampak luar)' },
      { id: 'f2', label: 'Lapisan lendir daun luar' },
    ],
    solusiDiminta: 'kembalikan-dana',
    nominalDiminta: 32000,
    status: 'menunggu-pembeli',
    batasWaktuTanggapan: estimasiSelesai ?? 'Sel, 10 Nov, 09.31',
    totalDanaDitahan: 272000,
  }] : undefined);

  return (
    <div className={className}>
      {pesanKonfirmasi && (
        <div className="p-3 bg-[#f3faf3] text-[#064e3b] text-sm font-bold border-b border-[#a9cfae]">
          {pesanKonfirmasi}
        </div>
      )}
      <TokoKomplain komplainList={listToPass} tahap="terkirim" />
    </div>
  );
}
