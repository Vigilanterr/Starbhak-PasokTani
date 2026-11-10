'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';

export interface RiwayatKoreksiStok {
  id: string;
  tanggal: string;
  jumlahKg: number;
  alasan: 'susut' | 'rusak' | 'bonus' | 'salah-hitung' | string;
}

export interface BatchStokItem {
  id: string;
  produkId?: string;
  kodeBatch?: string;
  tanggalPanen?: string;
  tanggalKedaluwarsa?: string;
  stokMasukKg?: number;
  sisaStokKg?: number;
  statusFefo?: 'segar' | 'mendekati-habis' | 'kritis' | 'kedaluwarsa' | string;
  riwayatKoreksi?: RiwayatKoreksiStok[];
  urutan?: number;
  judul?: string;
  label?: string;
  ked?: string;
  masuk?: string | number;
  terjual?: string | number;
  dipesan?: string | number;
  susut?: string | number;
  tersedia?: string | number;
  ket?: string;
}

export interface RiwayatStokItem {
  id: string;
  waktu: string;
  judul: string;
  catatan?: string;
  batch: string;
  ubah: string | number;
  sisa: string | number;
  oleh: string;
  jenis: 'pesanan' | 'koreksi' | 'masuk' | 'tarik' | string;
}

export interface TokoProdukStokProps {
  batchList?: BatchStokItem[];
  riwayatList?: RiwayatStokItem[];
  produkId?: string;
  namaProduk?: string;
  satuan?: string;
  batchBaru?: boolean;
  koreksiAwal?: boolean;
  onKoreksiStok?: (batchId: string, jumlah: number, alasan: string) => void;
  className?: string;
}

const DEFAULT_BATCHES: BatchStokItem[] = [
  {
    id: 'b-1',
    urutan: 1,
    judul: 'Panen Jum, 6 Nov',
    label: '5 hari lagi',
    ked: 'Layak jual sampai Jum, 13 Nov',
    masuk: '50 kg',
    terjual: '16 kg',
    dipesan: '24 kg',
    susut: '2 kg',
    tersedia: '8 kg',
    ket: '24 kg dipesan untuk 3 pesanan yang belum dikirim. Diskon Surplus mulai Sel, 10 Nov.',
  },
];

const DEFAULT_RIWAYAT: RiwayatStokItem[] = [
  {
    id: 'r-1',
    waktu: 'Sen, 9 Nov, 08.40',
    judul: 'Pesanan PT-26110822 (Toko Mang Dadang)',
    batch: 'Batch 6 Nov',
    ubah: '-20 kg',
    sisa: '8 kg',
    oleh: 'Sistem',
    jenis: 'pesanan',
  },
  {
    id: 'r-2',
    waktu: 'Min, 8 Nov, 16.10',
    judul: 'Koreksi stok: susut berat setelah panen',
    catatan: 'Mengering di gudang 2 hari.',
    batch: 'Batch 6 Nov',
    ubah: '-2 kg',
    sisa: '28 kg',
    oleh: 'Ujang (petani)',
    jenis: 'koreksi',
  },
  {
    id: 'r-3',
    waktu: 'Sab, 7 Nov, 11.20',
    judul: 'Pesanan PT-26110702 (Bu Siti)',
    batch: 'Batch 6 Nov',
    ubah: '-4 kg',
    sisa: '30 kg',
    oleh: 'Sistem',
    jenis: 'pesanan',
  },
  {
    id: 'r-4',
    waktu: 'Jum, 6 Nov, 14.05',
    judul: 'Panen masuk',
    batch: 'Batch 6 Nov',
    ubah: '+50 kg',
    sisa: '50 kg',
    oleh: 'Ujang (petani)',
    jenis: 'masuk',
  },
];

export function TokoProdukStok({
  batchList,
  riwayatList,
  produkId = 'kol',
  namaProduk = 'Kol Bulat Lembang',
  satuan = 'kg',
  batchBaru = false,
  koreksiAwal = false,
  onKoreksiStok,
  className = '',
}: TokoProdukStokProps) {
  const [batches, setBatches] = useState<BatchStokItem[]>(batchList ?? DEFAULT_BATCHES);
  const [saringRiwayat, setSaringRiwayat] = useState<string>('semua');
  const [tampilSelesai, setTampilSelesai] = useState<boolean>(false);

  // Correction Modal State
  const [modalBatchId, setModalBatchId] = useState<string | null>(koreksiAwal ? 'b-1' : null);
  const [koreksiFisik, setKoreksiFisik] = useState<number>(8);
  const [koreksiAlasan, setKoreksiAlasan] = useState<string>('susut');
  const [koreksiCatatan, setKoreksiCatatan] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const activeBatches = batchList ?? batches;
  const historyList = riwayatList ?? DEFAULT_RIWAYAT;

  const filteredHistory = saringRiwayat === 'semua'
    ? historyList
    : historyList.filter((item) => item.jenis === saringRiwayat);

  const selectedBatch = activeBatches.find((b) => b.id === modalBatchId);
  const tercatatNum = selectedBatch
    ? parseInt(String(selectedBatch.tersedia ?? '8').replace(/\D/g, ''), 10) || 8
    : 8;
  const delta = koreksiFisik - tercatatNum;

  const handleOpenCorrection = (id: string) => {
    setModalBatchId(id);
    const b = activeBatches.find((item) => item.id === id);
    const curr = b ? parseInt(String(b.tersedia ?? '8').replace(/\D/g, ''), 10) || 8 : 8;
    setKoreksiFisik(curr);
    setKoreksiAlasan('susut');
    setKoreksiCatatan('');
    setModalError('');
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (delta > 0 && koreksiAlasan !== 'hitung' && koreksiAlasan !== 'lain') {
      setModalError('Stok bertambah hanya untuk alasan Salah hitung atau Lainnya. Panen baru dicatat lewat Tambah stok.');
      return;
    }
    if (koreksiAlasan === 'lain' && !koreksiCatatan.trim()) {
      setModalError('Tulis catatan untuk alasan Lainnya.');
      return;
    }

    if (modalBatchId) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === modalBatchId
            ? { ...b, tersedia: `${koreksiFisik} ${satuan}` }
            : b
        )
      );
      if (onKoreksiStok) {
        onKoreksiStok(modalBatchId, koreksiFisik, koreksiAlasan);
      }
    }

    setPesanSukses(`Koreksi stok berhasil disimpan. Stok tersedia kini ${koreksiFisik} ${satuan}.`);
    setModalBatchId(null);
  };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1080px]">
          <div className="flex flex-col gap-4">
            <Link
              href={`/toko/produk/${produkId}`}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {namaProduk}
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                  Batch stok {namaProduk}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#3f5247]">
                  Tersedia <strong className="text-[#92400e]">8 {satuan}</strong>, dipesan 24 {satuan}, batas stok rendah 10 {satuan}.
                </p>
              </div>

              <Link
                href={`/toko/produk/${produkId}/stok-baru`}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0f5132]"
              >
                + Tambah stok
              </Link>
            </div>

            {pesanSukses && (
              <p aria-live="polite" className="text-sm font-bold text-[#157a4c]">
                {pesanSukses}
              </p>
            )}

            {batchBaru && (
              <aside aria-label="Notifikasi batch baru" className="p-3 rounded-xl bg-[#ebf2eb] border border-[#a3cfbb] text-xs sm:text-sm text-[#064e3b] font-semibold">
                Batch stok baru berhasil ditambahkan dan langsung aktif dalam antrean FEFO.
              </aside>
            )}

            {/* FEFO Explanation Section */}
            <section aria-labelledby="judul-aktif" className="flex flex-col gap-2.5">
              <h2 id="judul-aktif" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                Batch aktif
              </h2>
              <p className="p-3 rounded-xl bg-[#ebf2eb] text-xs sm:text-sm text-[#3f5247] flex items-start gap-2">
                <span className="font-bold text-[#064e3b]">⚡</span>
                <span>
                  <strong>Urutan FEFO (First-Expired, First-Out):</strong> Diurutkan dari yang paling cepat lewat batas jual. Pesanan baru selalu diambil dari batch paling atas agar sayuran lama tidak terbuang.
                </span>
              </p>

              {/* Batches List */}
              <ol className="list-none m-0 p-0 flex flex-col gap-3">
                {activeBatches.map((b) => (
                  <li
                    key={b.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="shrink-0 w-8 h-8 rounded-full bg-[#ebf2eb] text-[#064e3b] font-extrabold text-sm flex items-center justify-center"
                        >
                          {b.urutan ?? 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-base font-extrabold text-[#173b2b]">{b.judul}</strong>
                            <span className="px-2 py-0.5 rounded-full bg-[#fde2d2] text-[#9a3412] text-xs font-extrabold">
                              {b.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-[#c2410c] mt-0.5">{b.ked}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCorrection(b.id)}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-bold text-[#064e3b] hover:bg-[#f6f8f4]"
                      >
                        Koreksi stok
                      </button>
                    </div>

                    {/* Stacked bar */}
                    <div
                      role="img"
                      aria-label="Progress stok"
                      className="flex h-3 rounded-full overflow-hidden bg-[#eef0eb]"
                    >
                      <span style={{ width: '32%' }} className="bg-[#064e3b]" />
                      <span style={{ width: '48%' }} className="bg-[#157a4c] border-l border-white" />
                      <span style={{ width: '4%' }} className="bg-[#9aa79e] border-l border-white" />
                      <span style={{ width: '16%' }} className="bg-[#d5f6d5] border-l border-white" />
                    </div>

                    {/* Breakdown metrics */}
                    <dl className="m-0 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div>
                        <dt className="text-[#5a6b60] font-bold">Masuk</dt>
                        <dd className="m-0 font-extrabold text-sm text-[#173b2b]">{b.masuk ?? '50 kg'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#5a6b60] font-bold">Terjual</dt>
                        <dd className="m-0 font-extrabold text-sm text-[#173b2b]">{b.terjual ?? '16 kg'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#5a6b60] font-bold">Dipesan</dt>
                        <dd className="m-0 font-extrabold text-sm text-[#173b2b]">{b.dipesan ?? '24 kg'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#5a6b60] font-bold">Susut</dt>
                        <dd className="m-0 font-extrabold text-sm text-[#173b2b]">{b.susut ?? '2 kg'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#157a4c] font-bold">Tersedia</dt>
                        <dd className="m-0 font-extrabold text-base text-[#064e3b]">{b.tersedia ?? '8 kg'}</dd>
                      </div>
                    </dl>

                    {b.ket && (
                      <p className="text-xs text-[#3f5247] leading-relaxed mt-0.5">
                        {b.ket}
                      </p>
                    )}
                  </li>
                ))}
              </ol>

              {/* Collapsible Archive of finished batches */}
              <button
                type="button"
                aria-expanded={tampilSelesai}
                onClick={() => setTampilSelesai(!tampilSelesai)}
                className="self-start text-xs sm:text-sm font-extrabold text-[#157a4c] hover:underline cursor-pointer"
              >
                {tampilSelesai ? '▼ Sembunyikan batch selesai' : '▶ Lihat batch selesai (2 batch)'}
              </button>

              {tampilSelesai && (
                <ul className="list-none m-0 p-0 border border-[#dee3da] rounded-2xl bg-white divide-y divide-[#eef0eb] text-xs sm:text-sm">
                  <li className="p-3 sm:p-4 flex flex-wrap justify-between gap-2">
                    <strong>Panen Jum, 30 Okt</strong>
                    <span className="text-[#3f5247]">35 kg masuk, habis terjual Sel, 3 Nov</span>
                  </li>
                  <li className="p-3 sm:p-4 flex flex-wrap justify-between gap-2">
                    <strong>Panen Jum, 23 Okt</strong>
                    <span className="text-[#3f5247]">30 kg masuk, 28 kg terjual, 2 kg susut Jum, 30 Okt</span>
                  </li>
                </ul>
              )}
            </section>

            {/* Audit History Ledger */}
            <section aria-labelledby="judul-riwayat" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="judul-riwayat" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                  Riwayat stok
                </h2>
                <div role="group" aria-label="Saring riwayat" className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {['semua', 'pesanan', 'masuk', 'koreksi'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={saringRiwayat === s}
                      onClick={() => setSaringRiwayat(s)}
                      className={`min-h-[32px] px-3 rounded-full text-xs font-bold border capitalize ${
                        saringRiwayat === s
                          ? 'border-[#064e3b] bg-[#064e3b] text-white'
                          : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[#dee3da] text-[#5a6b60] text-xs">
                      <th className="py-2.5 font-bold">Waktu</th>
                      <th className="py-2.5 font-bold">Kejadian</th>
                      <th className="py-2.5 font-bold">Batch</th>
                      <th className="py-2.5 font-bold">Perubahan</th>
                      <th className="py-2.5 font-bold">Sisa</th>
                      <th className="py-2.5 font-bold">Oleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef0eb]">
                    {filteredHistory.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 text-[#3f5247]">{r.waktu}</td>
                        <td className="py-2.5">
                          <strong className="font-bold text-[#173b2b] block">{r.judul}</strong>
                          {r.catatan && <span className="text-xs text-[#5a6b60]">{r.catatan}</span>}
                        </td>
                        <td className="py-2.5">{r.batch}</td>
                        <td className={`py-2.5 font-extrabold ${String(r.ubah).startsWith('-') ? 'text-[#b42318]' : 'text-[#157a4c]'}`}>
                          {r.ubah}
                        </td>
                        <td className="py-2.5 font-bold text-[#173b2b]">{r.sisa}</td>
                        <td className="py-2.5 text-[#3f5247]">{r.oleh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Stock Correction Modal Dialog */}
      {modalBatchId && selectedBatch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-koreksi"
          className="fixed inset-0 z-50 bg-[#173b2b]/50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-[480px] p-5 sm:p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 id="judul-koreksi" className="text-lg font-extrabold text-[#173b2b]">
                  Koreksi stok {selectedBatch.judul}
                </h3>
                <p className="text-xs text-[#3f5247] mt-0.5">
                  Tercatat saat ini: <strong>{tercatatNum} {satuan}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalBatchId(null)}
                className="text-[#5a6b60] hover:text-[#173b2b] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <p className="p-3 rounded-xl border border-[#b42318] bg-[#fdecea] text-xs text-[#8a1c12] font-bold">
                {modalError}
              </p>
            )}

            <form onSubmit={handleSaveCorrection} className="flex flex-col gap-3.5">
              {/* Stepper counter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#173b2b]">
                  Jumlah fisik sebenarnya ({satuan})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setKoreksiFisik(Math.max(0, koreksiFisik - 1))}
                    className="w-10 h-10 rounded-xl border border-[#064e3b] text-[#064e3b] font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={koreksiFisik}
                    onChange={(e) => setKoreksiFisik(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
                    className="flex-1 h-10 text-center font-extrabold text-lg border border-[#dee3da] rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setKoreksiFisik(koreksiFisik + 1)}
                    className="w-10 h-10 rounded-xl border border-[#064e3b] text-[#064e3b] font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-[#5a6b60]">
                  Perubahan: <strong className={delta < 0 ? 'text-[#b42318]' : delta > 0 ? 'text-[#157a4c]' : 'text-[#3f5247]'}>
                    {delta > 0 ? `+${delta}` : delta} {satuan}
                  </strong>
                </p>
              </div>

              {/* Reason pills */}
              <fieldset className="border-0 p-0 m-0 flex flex-col gap-1.5">
                <legend className="text-xs font-bold text-[#173b2b]">
                  Alasan koreksi
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'susut', label: 'Susut berat' },
                    { id: 'rusak', label: 'Rusak / busuk' },
                    { id: 'hitung', label: 'Salah hitung' },
                    { id: 'pakai', label: 'Dipakai sendiri' },
                    { id: 'lain', label: 'Lainnya' },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer ${
                        koreksiAlasan === r.id
                          ? 'bg-[#ebf2eb] border-[#064e3b] text-[#064e3b]'
                          : 'bg-white border-[#dee3da] text-[#173b2b]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="alasan-koreksi"
                        checked={koreksiAlasan === r.id}
                        onChange={() => setKoreksiAlasan(r.id)}
                        className="sr-only"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-1">
                <label htmlFor="catatan-koreksi" className="text-xs font-bold text-[#173b2b]">
                  Catatan {koreksiAlasan === 'lain' && <span className="text-[#b42318]">*</span>}
                </label>
                <textarea
                  id="catatan-koreksi"
                  rows={2}
                  value={koreksiCatatan}
                  onChange={(e) => setKoreksiCatatan(e.target.value)}
                  placeholder="Keterangan tambahan audit stok..."
                  className="p-2.5 rounded-xl border border-[#dee3da] text-xs resize-y"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0f5132]"
                >
                  Simpan koreksi
                </button>
                <button
                  type="button"
                  onClick={() => setModalBatchId(null)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#dee3da] text-xs sm:text-sm font-bold text-[#173b2b] hover:bg-[#f6f8f4]"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="produk" />
      </div>
    </div>
  );
}

export default TokoProdukStok;
