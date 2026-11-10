'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChipStatus, StatusPasokTani } from '../common';
import { AkunMenu } from '../layout';

export type TabSaringIkuti = 'semua' | 'berubah' | 'komitmen';

export interface KomitmenSayaPadaWaitlist {
  rentang?: string;
  rentangKu?: string;
  ket?: string;
  ketKu?: string;
  aksi?: string;
  aksiKu?: string;
  href?: string;
  hrefKu?: string;
  urgen?: boolean;
  uangMuka?: number;
}

export type KomitmenSayaItem = KomitmenSayaPadaWaitlist;

export interface ItemIkuti {
  id: string;
  nama: string;
  petani: string;
  status: StatusPasokTani | string;
  awal: string;
  akhir: string;
  persen: number;
  baru?: boolean;
  berubah?: boolean;
  judulUbah?: string;
  semula?: string;
  tglUbah?: string;
  alasanUbah?: string;
  fotoUrl?: string;
  altFoto?: string;
  tglKabar: string;
  kabar: string;
  ku?: KomitmenSayaPadaWaitlist | null;
  punyaKomitmen?: boolean;
  buka?: boolean;
  bukaKomitmen?: boolean;
  harga?: string;
  hargaPerkiraan?: number;
  hargaPerKg?: number;
  minPetani?: number;
  minKomitmen?: number;
  teksKuota?: string;
  kuota?: number;
  terkomitmen?: number;
  lebarMin?: string;
  lebarMaks?: string;
  teksSisa?: string;
  hanyaPenting?: boolean;
}

export type DaftarTungguIkutiItem = ItemIkuti;

export interface IkutiProps {
  waitlistFollowList?: ItemIkuti[];
  daftarTungguList?: ItemIkuti[];
  dialogAwal?: boolean;
  saldoDompet?: number;
  tabAwal?: TabSaringIkuti;
  onFilterChange?: (tab: TabSaringIkuti) => void;
  onToggleHanyaPenting?: (id: string, hanyaPenting: boolean) => void;
  onBerhentiIkuti?: (id: string) => void;
  onAjukanKomitmen?: (id: string, minKg: number, maksKg: number, metode: string) => void;
  onSubmitKomitmenBaru?: (data: {
    tanamanId: string;
    minKg: number;
    maksKg: number;
    metode: string;
  }) => void;
  className?: string;
}

const DEFAULT_IKUTI_LIST: ItemIkuti[] = [
  {
    id: 'kentang-granola',
    nama: 'Kentang Granola',
    petani: 'Kebun Mang Ujang, Lembang',
    status: 'ditanam',
    awal: '10 Sep',
    akhir: '2 sampai 6 Des',
    persen: 72,
    baru: true,
    tglKabar: 'Kemarin, 14.10',
    kabar:
      'Tanaman mulai berbunga rata. Umbi mulai membesar di bawah mulsa. Kalau cuaca tetap cerah, panen sesuai rencana awal Desember.',
    buka: true,
    bukaKomitmen: true,
    harga: 'Rp 11.000',
    hargaPerKg: 11000,
    hargaPerkiraan: 11000,
    minPetani: 10,
    minKomitmen: 10,
    teksKuota: '90 dari 500 kg dipesan',
    kuota: 500,
    terkomitmen: 90,
    lebarMin: '18%',
    lebarMaks: '30%',
    teksSisa: 'Tersisa 410 kg untuk dipesan. Uang muka 30% ditahan Pasok Tani, harga dikunci.',
    hanyaPenting: false,
  },
  {
    id: 'bawang-merah-bima',
    nama: 'Bawang Merah Bima',
    petani: 'Kebun Pak Darsono, Cirebon',
    status: 'tertunda',
    awal: '1 Okt',
    akhir: 'Rab, 25 Nov',
    persen: 85,
    berubah: true,
    judulUbah: 'Jadwal panen mundur 9 hari',
    semula: 'Sen, 16 Nov',
    tglUbah: 'Kam, 12 Nov',
    alasanUbah:
      'Hujan deras seminggu berturut-turut di Cirebon membuat pengeringan tanah lebih lambat. Petani butuh 9 hari tambahan agar umbi tidak busuk saat dipanen.',
    tglKabar: 'Kam, 12 Nov',
    kabar:
      'Tanah masih becek. Kami tunda panen ke 25 Nov supaya umbi kering alami dan kualitas simpan tetap prima.',
    punyaKomitmen: true,
    ku: {
      rentang: '10 sampai 15 kg',
      rentangKu: '10 sampai 15 kg',
      ket: 'Uang muka Rp 135.000 ditahan. Karena panen mundur lebih dari 7 hari, kamu boleh batal tanpa potongan.',
      ketKu: 'Uang muka Rp 135.000 ditahan. Karena panen mundur lebih dari 7 hari, kamu boleh batal tanpa potongan.',
      aksi: 'Pilih lanjut atau batal',
      aksiKu: 'Pilih lanjut atau batal',
      href: '/komitmen/KM-26101908',
      hrefKu: '/komitmen/KM-26101908',
      urgen: true,
      uangMuka: 135000,
    },
    hanyaPenting: true,
  },
  {
    id: 'beras-pandan-wangi',
    nama: 'Beras Pandan Wangi',
    petani: 'Sawah Bu Eti, Cianjur',
    status: 'ditanam',
    awal: '26 Okt',
    akhir: '18 sampai 20 Nov',
    persen: 92,
    tglKabar: '3 hari lalu',
    kabar:
      'Bulir padi sudah menguning merata. Air sawah sudah dikeringkan untuk persiapan panen.',
    punyaKomitmen: true,
    ku: {
      rentang: '5 sampai 10 kg',
      rentangKu: '5 sampai 10 kg',
      ket: 'Uang muka Rp 45.000 ditahan. Menunggu petani mengisi hasil panen.',
      ketKu: 'Uang muka Rp 45.000 ditahan. Menunggu petani mengisi hasil panen.',
      aksi: 'Lihat Komitmen',
      aksiKu: 'Lihat Komitmen',
      href: '/komitmen/KM-26102204',
      hrefKu: '/komitmen/KM-26102204',
      urgen: false,
      uangMuka: 45000,
    },
    hanyaPenting: false,
  },
];

export function Ikuti({
  waitlistFollowList,
  daftarTungguList,
  dialogAwal = false,
  saldoDompet = 63500,
  tabAwal = 'semua',
  onFilterChange,
  onToggleHanyaPenting,
  onBerhentiIkuti,
  onAjukanKomitmen,
  onSubmitKomitmenBaru,
  className = '',
}: IkutiProps) {
  const initialItems = waitlistFollowList ?? daftarTungguList ?? DEFAULT_IKUTI_LIST;
  const [items, setItems] = useState<ItemIkuti[]>(initialItems);
  const [activeTab, setActiveTab] = useState<TabSaringIkuti>(tabAwal);
  const [undoItem, setUndoItem] = useState<ItemIkuti | null>(null);

  // Modal dialog states
  const [dialogBuka, setDialogBuka] = useState<boolean>(dialogAwal);
  const [selectedCrop, setSelectedCrop] = useState<ItemIkuti | null>(
    initialItems.find((x) => x.buka || x.bukaKomitmen) ?? initialItems[0] ?? null
  );
  const [minKgInput, setMinKgInput] = useState<string>('10');
  const [maksKgInput, setMaksKgInput] = useState<string>('15');
  const [galatMin, setGalatMin] = useState<string>('');
  const [galatMaks, setGalatMaks] = useState<string>('');
  const [metodeBayar, setMetodeBayar] = useState<string>('dompet');
  const [setujuAturan, setSetujuAturan] = useState<boolean>(true);
  const [galatSetuju, setGalatSetuju] = useState<boolean>(false);
  const [suksesTerkirim, setSuksesTerkirim] = useState<boolean>(false);

  // Tab calculations
  const countSemua = items.length;
  const countBerubah = items.filter((x) => !!x.berubah).length;
  const countKomitmen = items.filter((x) => !!x.punyaKomitmen || !!x.ku).length;

  const filteredItems = items.filter((x) => {
    if (activeTab === 'berubah') return !!x.berubah;
    if (activeTab === 'komitmen') return !!x.punyaKomitmen || !!x.ku;
    return true;
  });

  const handleTabClick = (tab: TabSaringIkuti) => {
    setActiveTab(tab);
    onFilterChange?.(tab);
  };

  const handleBerhenti = (crop: ItemIkuti) => {
    setItems((prev) => prev.filter((it) => it.id !== crop.id));
    setUndoItem(crop);
    onBerhentiIkuti?.(crop.id);
  };

  const handleUndo = () => {
    if (undoItem) {
      setItems((prev) => [undoItem, ...prev]);
      setUndoItem(null);
    }
  };

  const handleTogglePenting = (cropId: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    setItems((prev) =>
      prev.map((it) => (it.id === cropId ? { ...it, hanyaPenting: nextVal } : it))
    );
    onToggleHanyaPenting?.(cropId, nextVal);
  };

  const handleBukaDialogKomitmen = (crop: ItemIkuti) => {
    setSelectedCrop(crop);
    setMinKgInput(String(crop.minPetani ?? crop.minKomitmen ?? 10));
    setMaksKgInput(String((crop.minPetani ?? crop.minKomitmen ?? 10) + 5));
    setGalatMin('');
    setGalatMaks('');
    setGalatSetuju(false);
    setSuksesTerkirim(false);
    setDialogBuka(true);
  };

  const handleTutupDialog = () => {
    setDialogBuka(false);
    setSuksesTerkirim(false);
  };

  // Calculations inside modal
  const activeHargaPerKg = selectedCrop?.hargaPerKg ?? selectedCrop?.hargaPerkiraan ?? 11000;
  const numMin = parseInt(minKgInput, 10) || 0;
  const numMaks = parseInt(maksKgInput, 10) || 0;
  const uangMukaHitung = Math.round(numMaks * activeHargaPerKg * 0.3);
  const totalMin = numMin * activeHargaPerKg;
  const totalMaks = numMaks * activeHargaPerKg;

  const handleKirimKomitmen = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const minBatas = selectedCrop?.minPetani ?? selectedCrop?.minKomitmen ?? 10;
    const sisaKuota = (selectedCrop?.kuota ?? 500) - (selectedCrop?.terkomitmen ?? 90);

    if (numMin < minBatas) {
      setGalatMin(`Petani menerima paling sedikit ${minBatas} kg.`);
      valid = false;
    } else if (numMin > sisaKuota) {
      setGalatMin(`Sisa kuota ${sisaKuota} kg. Kecilkan jumlah paling sedikit.`);
      valid = false;
    } else {
      setGalatMin('');
    }

    if (numMaks < numMin) {
      setGalatMaks('Harus sama atau lebih dari jumlah paling sedikit.');
      valid = false;
    } else if (numMaks > sisaKuota) {
      setGalatMaks(`Paling banyak tidak boleh melebihi sisa kuota ${sisaKuota} kg.`);
      valid = false;
    } else {
      setGalatMaks('');
    }

    if (!setujuAturan) {
      setGalatSetuju(true);
      valid = false;
    } else {
      setGalatSetuju(false);
    }

    if (!valid || !selectedCrop) return;

    onAjukanKomitmen?.(selectedCrop.id, numMin, numMaks, metodeBayar);
    onSubmitKomitmenBaru?.({
      tanamanId: selectedCrop.id,
      minKg: numMin,
      maksKg: numMaks,
      metode: metodeBayar,
    });

    // Mark as holding commitment
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedCrop.id
          ? {
              ...it,
              punyaKomitmen: true,
              buka: false,
              bukaKomitmen: false,
              ku: {
                rentang: `${numMin} sampai ${numMaks} kg`,
                rentangKu: `${numMin} sampai ${numMaks} kg`,
                ket: `Uang muka Rp ${uangMukaHitung.toLocaleString('id-ID')} ditahan. Urutanmu ke-15.`,
                ketKu: `Uang muka Rp ${uangMukaHitung.toLocaleString('id-ID')} ditahan. Urutanmu ke-15.`,
                aksi: 'Lihat Komitmen',
                aksiKu: 'Lihat Komitmen',
                href: '/komitmen',
                hrefKu: '/komitmen',
                urgen: false,
                uangMuka: uangMukaHitung,
              },
            }
          : it
      )
    );

    setSuksesTerkirim(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-7 md:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block flex-none w-[272px]">
            <AkunMenu aktif="diikuti" />
          </div>

          {/* Main Content Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-3.5">
            {/* Title Header */}
            <div>
              <h1 className="m-0 text-[28px] md:text-[34px] font-extrabold leading-tight tracking-tight">
                Daftar Tunggu diikuti
              </h1>
              <p className="m-0 mt-1.5 max-w-[62ch] text-[15px] leading-relaxed text-[#3f5247]">
                Kabar dari lahan sebelum panen. Pesan lebih dulu lewat Komitmen supaya kebagian hasil panennya.
              </p>
            </div>

            {/* Filter Tabs */}
            <div
              role="group"
              aria-label="Saring"
              className="flex gap-2 overflow-x-auto pb-0.5"
            >
              <button
                type="button"
                aria-pressed={activeTab === 'semua'}
                onClick={() => handleTabClick('semua')}
                className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-sm font-bold cursor-pointer ${
                  activeTab === 'semua'
                    ? 'border border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                }`}
              >
                Semua ({countSemua})
              </button>
              <button
                type="button"
                aria-pressed={activeTab === 'berubah'}
                onClick={() => handleTabClick('berubah')}
                className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-sm font-bold cursor-pointer ${
                  activeTab === 'berubah'
                    ? 'border border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                }`}
              >
                Jadwal berubah ({countBerubah})
              </button>
              <button
                type="button"
                aria-pressed={activeTab === 'komitmen'}
                onClick={() => handleTabClick('komitmen')}
                className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-sm font-bold cursor-pointer ${
                  activeTab === 'komitmen'
                    ? 'border border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                }`}
              >
                Ada Komitmen-ku ({countKomitmen})
              </button>
            </div>

            {/* Undo Toast Banner */}
            {undoItem && (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-2.5 px-3.5 rounded-xl bg-[#173b2b] text-white"
              >
                <p className="m-0 text-sm font-bold">
                  Berhenti mengikuti {undoItem.nama}.
                </p>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="min-h-[40px] px-3.5 border-[1.5px] border-white rounded-lg bg-transparent text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                >
                  Batalkan
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <p className="m-0 p-4 md:p-[18px] border border-dashed border-[#c9d2c6] rounded-2xl bg-white text-sm leading-relaxed text-[#3f5247]">
                {activeTab === 'berubah'
                  ? 'Tidak ada tanaman dengan jadwal panen berubah.'
                  : activeTab === 'komitmen'
                  ? 'Belum ada Komitmen yang kamu buat di Daftar Tunggu.'
                  : 'Belum ada tanaman yang kamu ikuti. Kunjungi halaman produk atau petani untuk mulai mengikuti.'}
              </p>
            )}

            {/* Followed Crops List */}
            {filteredItems.length > 0 && (
              <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
                {filteredItems.map((k) => {
                  const hasCommitment = !!k.punyaKomitmen || !!k.ku;
                  const isUrgent = !!k.ku?.urgen;
                  const isPostponed = !!k.berubah;
                  const isOpenForCommitment = !!k.buka || !!k.bukaKomitmen;
                  const percentVal = Math.min(Math.max(k.persen, 0), 100);

                  return (
                    <li
                      key={k.id}
                      className={`p-4 md:p-[18px] rounded-2xl bg-white flex flex-col gap-3.5 ${
                        isUrgent
                          ? 'border-[1.5px] border-[#e9c75c]'
                          : 'border border-[#dee3da]'
                      }`}
                    >
                      {/* Top Card Row */}
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0">
                          <h2 className="m-0 flex flex-wrap items-center gap-2 text-lg font-extrabold text-[#173b2b]">
                            {k.nama}
                            {k.baru && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#064e3b]">
                                <span
                                  aria-hidden="true"
                                  className="w-2 h-2 rounded-full bg-[#c2410c]"
                                />
                                Kabar baru
                              </span>
                            )}
                          </h2>
                          <p className="m-0 mt-0.5 text-[13px] text-[#3f5247]">
                            {k.petani}
                          </p>
                        </div>
                        <ChipStatus status={k.status} />
                      </div>

                      {/* Dotted Timeline Bar */}
                      <div>
                        <div className="flex justify-between gap-2 text-xs font-bold text-[#3f5247]">
                          <span>{k.awal}</span>
                          <span>{k.akhir}</span>
                        </div>
                        <div aria-hidden="true" className="relative h-[22px]">
                          <span
                            className="absolute left-0 top-2.5 border-t-2 border-dotted border-[#c2a032]"
                            style={{ width: `${percentVal}%` }}
                          />
                          <span
                            className="absolute right-0 top-2.5 border-t-2 border-dotted border-[#c9d2c6]"
                            style={{ width: `${100 - percentVal}%` }}
                          />
                          <span
                            className={`absolute right-0 top-[5px] w-3 h-3 box-border rounded-full bg-white border-2 ${
                              isPostponed ? 'border-[#b45309]' : 'border-[#c2a032]'
                            }`}
                          />
                          <span
                            className="absolute top-0.5 w-[18px] h-[18px] -ml-[9px] box-border rounded-full bg-[#064e3b] grid place-items-center"
                            style={{ left: `${percentVal}%` }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e9c75c]" />
                          </span>
                        </div>
                      </div>

                      {/* Schedule Change Card (if postponed) */}
                      {isPostponed && (
                        <div className="p-3 md:px-3.5 rounded-xl bg-[#fef3c7]">
                          <p className="m-0 text-sm font-extrabold text-[#92400e]">
                            {k.judulUbah ?? 'Jadwal panen berubah'}
                          </p>
                          <p className="m-0 mt-0.5 text-[13px] text-[#92400e]">
                            Semula <del>{k.semula}</del>. Diubah {k.tglUbah}.
                          </p>
                          <p className="m-0 mt-1.5 text-[13px] leading-normal text-[#3f5247]">
                            {k.alasanUbah}
                          </p>
                        </div>
                      )}

                      {/* Farmer Field Condition Update Box */}
                      <div className="flex gap-3 items-start">
                        {/* Photo or 5-band CSS placeholder */}
                        <div
                          role="img"
                          aria-label={k.altFoto ?? `Foto kabar lahan ${k.nama}`}
                          className="shrink-0 w-24 aspect-[4/3] rounded-lg overflow-hidden flex flex-col border border-[#dee3da]"
                        >
                          <span className="h-[34%] bg-[#dfeee6]" />
                          <span className="h-[16%] bg-[#9cc79a]" />
                          <span className="h-[16%] bg-[#7fb27d]" />
                          <span className="h-[17%] bg-[#5f9a5d]" />
                          <span className="flex-1 bg-[#4a8148]" />
                        </div>
                        <div className="min-w-0">
                          <p className="m-0 text-xs font-bold text-[#5a6b60]">
                            Kabar lahan {k.tglKabar}
                          </p>
                          <p
                            className={`m-0 mt-0.5 text-sm leading-normal ${
                              k.baru ? 'font-bold' : 'font-normal'
                            } text-[#173b2b]`}
                          >
                            {k.kabar}
                          </p>
                        </div>
                      </div>

                      {/* Existing Commitment Callout */}
                      {hasCommitment && (
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3 md:px-3.5 rounded-xl bg-[#f3faf3] border border-[#cfe5d2]">
                          <div className="min-w-0">
                            <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                              Komitmen-mu {k.ku?.rentangKu ?? k.ku?.rentang ?? '10 sampai 15 kg'}
                            </p>
                            <p className="m-0 mt-0.5 text-[13px] leading-normal text-[#3f5247]">
                              {k.ku?.ketKu ?? k.ku?.ket ?? 'Uang muka ditahan.'}
                            </p>
                          </div>
                          <Link
                            href={k.ku?.hrefKu ?? k.ku?.href ?? '/komitmen'}
                            className={`shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-xl border-[1.5px] border-[#064e3b] text-sm font-extrabold no-underline ${
                              isUrgent
                                ? 'bg-[#064e3b] text-white hover:bg-[#157a4c]'
                                : 'bg-white text-[#064e3b] hover:bg-[#f3faf3]'
                            }`}
                          >
                            {k.ku?.aksiKu ?? k.ku?.aksi ?? 'Lihat Komitmen'}
                          </Link>
                        </div>
                      )}

                      {/* Open Commitment Quota Callout */}
                      {!hasCommitment && isOpenForCommitment && (
                        <div className="flex flex-col gap-2.5 p-3 md:px-3.5 rounded-xl bg-[#f6f8f4]">
                          <p className="m-0 flex flex-wrap justify-between gap-x-2 gap-y-0.5 text-[13px]">
                            <span>
                              <strong>Komitmen dibuka</strong>, {k.harga ?? 'Rp 11.000'}/kg, minimal {k.minPetani ?? 10} kg
                            </span>
                            <span className="text-[#3f5247]">
                              {k.teksKuota ?? '90 dari 500 kg dipesan'}
                            </span>
                          </p>
                          <div
                            aria-hidden="true"
                            className="relative h-2.5 rounded-full bg-[#e3ebe2] overflow-hidden"
                          >
                            <span
                              className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(135deg,#e9d79a_0_4px,#f4e9c4_4px_8px)]"
                              style={{ width: k.lebarMaks ?? '30%' }}
                            />
                            <span
                              className="absolute inset-y-0 left-0 rounded-full bg-[#c2a032]"
                              style={{ width: k.lebarMin ?? '18%' }}
                            />
                          </div>
                          <p className="m-0 text-[13px] leading-normal text-[#3f5247]">
                            {k.teksSisa ?? 'Tersisa 410 kg untuk dipesan. Uang muka 30% ditahan Pasok Tani, harga dikunci.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleBukaDialogKomitmen(k)}
                            className="self-start min-h-[48px] px-[18px] border-0 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold cursor-pointer hover:bg-[#157a4c]"
                          >
                            Buat Komitmen
                          </button>
                        </div>
                      )}

                      {/* Bottom Card Row */}
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-3 border-t border-[#eef0eb]">
                        <label className="inline-flex items-center gap-2.5 min-h-[44px] text-sm text-[#173b2b] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!k.hanyaPenting}
                            onChange={() => handleTogglePenting(k.id, !!k.hanyaPenting)}
                            className="w-5 h-5 m-0 accent-[#064e3b]"
                          />
                          Kabari hanya jadwal berubah dan panen
                        </label>
                        {hasCommitment ? (
                          <span className="text-[13px] text-[#5a6b60]">
                            Pemegang Komitmen selalu dapat kabar.
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBerhenti(k)}
                            className="min-h-[44px] px-3 border-0 bg-transparent text-[#3f5247] text-sm font-bold underline cursor-pointer hover:text-[#8a1c12]"
                          >
                            Berhenti ikuti
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Create Commitment Modal Dialog */}
      {dialogBuka && selectedCrop && (
        <div className="fixed inset-0 z-20 bg-[rgba(23,59,43,0.5)] flex justify-center items-start p-2.5 md:p-4 pt-6 md:pt-20 box-border overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-km"
            className="w-full max-w-[520px] p-5 md:p-[22px] rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5 box-border"
          >
            {!suksesTerkirim ? (
              <form onSubmit={handleKirimKomitmen} className="m-0 flex flex-col gap-3.5">
                <div>
                  <h2
                    id="judul-km"
                    className="m-0 text-xl font-extrabold leading-tight text-[#173b2b]"
                  >
                    Komitmen {selectedCrop.nama}
                  </h2>
                  <p className="m-0 mt-1 text-sm text-[#3f5247]">
                    {selectedCrop.petani}. Rp {activeHargaPerKg.toLocaleString('id-ID')}/kg, harga dikunci. Perkiraan panen {selectedCrop.akhir}.
                  </p>
                </div>

                {/* Min & Max Inputs */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 basis-[160px] flex flex-col gap-1.5">
                    <label htmlFor="km-min" className="text-[15px] font-bold text-[#173b2b]">
                      Paling sedikit <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="km-min"
                        type="text"
                        inputMode="numeric"
                        value={minKgInput}
                        onChange={(e) => {
                          setMinKgInput(e.target.value);
                          setGalatMin('');
                        }}
                        className={`w-full h-[52px] box-border px-3.5 pr-11 border-[1.5px] rounded-xl text-lg font-bold text-[#173b2b] bg-white ${
                          galatMin ? 'border-[#b42318]' : 'border-[#7d877e]'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute right-3.5 top-[15px] text-base font-bold text-[#5a6b60]"
                      >
                        kg
                      </span>
                    </div>
                    <p
                      className={`m-0 text-[13px] leading-tight ${
                        galatMin ? 'text-[#b42318] font-bold' : 'text-[#5a6b60]'
                      }`}
                    >
                      {galatMin || `Minimal ${selectedCrop.minPetani ?? 10} kg dari petani.`}
                    </p>
                  </div>

                  <div className="flex-1 basis-[160px] flex flex-col gap-1.5">
                    <label htmlFor="km-maks" className="text-[15px] font-bold text-[#173b2b]">
                      Paling banyak <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="km-maks"
                        type="text"
                        inputMode="numeric"
                        value={maksKgInput}
                        onChange={(e) => {
                          setMaksKgInput(e.target.value);
                          setGalatMaks('');
                        }}
                        className={`w-full h-[52px] box-border px-3.5 pr-11 border-[1.5px] rounded-xl text-lg font-bold text-[#173b2b] bg-white ${
                          galatMaks ? 'border-[#b42318]' : 'border-[#7d877e]'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute right-3.5 top-[15px] text-base font-bold text-[#5a6b60]"
                      >
                        kg
                      </span>
                    </div>
                    <p
                      className={`m-0 text-[13px] leading-tight ${
                        galatMaks ? 'text-[#b42318] font-bold' : 'text-[#5a6b60]'
                      }`}
                    >
                      {galatMaks || 'Batas maksimal tambahan kalau hasil cukup.'}
                    </p>
                  </div>
                </div>

                {/* Downpayment Calculations */}
                <dl className="m-0 p-3 md:px-3.5 rounded-xl bg-[#f6f8f4] flex flex-col gap-2 text-sm">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
                    <dt className="text-[#3f5247]">
                      Uang muka sekarang{' '}
                      <span className="px-1.5 border border-dashed border-[#c2a032] rounded bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                        30% sementara
                      </span>
                    </dt>
                    <dd className="m-0 font-extrabold text-[#173b2b]">
                      Rp {uangMukaHitung.toLocaleString('id-ID')}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
                    <dt className="text-[#3f5247]">Perkiraan total</dt>
                    <dd className="m-0 text-[#173b2b]">
                      Rp {totalMin.toLocaleString('id-ID')} sampai Rp {totalMaks.toLocaleString('id-ID')}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
                    <dt className="text-[#3f5247]">Urutanmu</dt>
                    <dd className="m-0 text-[#173b2b]">ke-15</dd>
                  </div>
                </dl>

                {/* Rules List */}
                <ol className="m-0 pl-5 flex flex-col gap-1 text-[13px] leading-normal text-[#3f5247]">
                  <li>
                    Setelah panen, jumlah paling sedikit dipenuhi dulu sesuai urutan, lalu tambahan sampai paling banyak kalau hasil cukup.
                  </li>
                  <li>Kamu dapat kabar jumlah pastinya, lalu bayar sisanya dalam 48 jam.</li>
                  <li>Dikirim paling lambat 3 hari setelah lunas. Jadwal bisa diubah 1 kali gratis.</li>
                </ol>

                {/* Payment Method Radio List */}
                <fieldset className="m-0 p-0 border-0">
                  <legend className="p-0 mb-2 text-[15px] font-bold text-[#173b2b]">
                    Bayar uang muka dengan
                  </legend>
                  <div className="flex flex-col gap-2">
                    <label
                      className={`flex items-start gap-2.5 min-h-[44px] p-2.5 px-3.5 box-border rounded-xl cursor-pointer ${
                        metodeBayar === 'dompet'
                          ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                          : 'border border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="km-metode"
                        checked={metodeBayar === 'dompet'}
                        onChange={() => setMetodeBayar('dompet')}
                        className="w-5 h-5 mt-0.5 m-0 accent-[#064e3b]"
                      />
                      <span>
                        <strong className="block text-[15px] text-[#173b2b]">
                          Dompet Pasok Tani
                        </strong>
                        <span className="text-[13px] text-[#3f5247]">
                          Saldo Rp {saldoDompet.toLocaleString('id-ID')}. Otomatis dipotong dan ditahan.
                        </span>
                      </span>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 min-h-[44px] p-2.5 px-3.5 box-border rounded-xl cursor-pointer ${
                        metodeBayar === 'va'
                          ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                          : 'border border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="km-metode"
                        checked={metodeBayar === 'va'}
                        onChange={() => setMetodeBayar('va')}
                        className="w-5 h-5 mt-0.5 m-0 accent-[#064e3b]"
                      />
                      <span>
                        <strong className="block text-[15px] text-[#173b2b]">
                          Virtual Account Bank
                        </strong>
                        <span className="text-[13px] text-[#3f5247]">
                          BCA, Mandiri, BRI, BNI.
                        </span>
                      </span>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 min-h-[44px] p-2.5 px-3.5 box-border rounded-xl cursor-pointer ${
                        metodeBayar === 'qris'
                          ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                          : 'border border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="km-metode"
                        checked={metodeBayar === 'qris'}
                        onChange={() => setMetodeBayar('qris')}
                        className="w-5 h-5 mt-0.5 m-0 accent-[#064e3b]"
                      />
                      <span>
                        <strong className="block text-[15px] text-[#173b2b]">
                          QRIS
                        </strong>
                        <span className="text-[13px] text-[#3f5247]">
                          Scan instan dari semua m-banking & e-wallet.
                        </span>
                      </span>
                    </label>
                  </div>
                </fieldset>

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-2.5 min-h-[44px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setujuAturan}
                    onChange={(e) => {
                      setSetujuAturan(e.target.checked);
                      setGalatSetuju(false);
                    }}
                    className="w-[22px] h-[22px] mt-0.5 m-0 accent-[#064e3b]"
                  />
                  <span className="text-sm leading-normal text-[#173b2b]">
                    Aku paham: batal setelah ini kena potongan 20% dari uang muka{' '}
                    <span className="px-1.5 border border-dashed border-[#c2a032] rounded bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                      sementara
                    </span>
                    . Kalau gagal panen atau mundur lebih dari 7 hari, uang muka kembali penuh.
                  </span>
                </label>
                {galatSetuju && (
                  <p className="m-0 -mt-1.5 text-[13px] font-bold text-[#b42318]">
                    Centang dulu tanda paham aturannya.
                  </p>
                )}

                {/* Modal Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full min-h-[52px] border-0 rounded-xl bg-[#064e3b] text-white text-base font-extrabold cursor-pointer hover:bg-[#157a4c]"
                  >
                    Bayar uang muka Rp {uangMukaHitung.toLocaleString('id-ID')}
                  </button>
                  <button
                    type="button"
                    onClick={handleTutupDialog}
                    className="w-full min-h-[48px] border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] font-bold cursor-pointer hover:bg-[#f6f8f4]"
                  >
                    Nanti saja
                  </button>
                </div>
              </form>
            ) : (
              /* Success Confirmation */
              <div role="status" className="flex flex-col gap-3">
                <h2 className="m-0 text-xl font-extrabold leading-tight text-[#173b2b]">
                  Komitmen tercatat. Kamu urutan ke-15.
                </h2>
                <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                  Uang muka Rp {uangMukaHitung.toLocaleString('id-ID')} sudah ditahan Pasok Tani. Kami akan kabari setiap perkembangan dari lahan sampai panen siap.
                </p>
                <Link
                  href="/komitmen"
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#157a4c]"
                >
                  Lihat Komitmen saya
                </Link>
                <button
                  type="button"
                  onClick={handleTutupDialog}
                  className="w-full min-h-[48px] border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] font-bold cursor-pointer hover:bg-[#f6f8f4]"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Ikuti;
