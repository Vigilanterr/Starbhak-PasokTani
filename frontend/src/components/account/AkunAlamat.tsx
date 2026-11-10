'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';
import { AlamatForm, AlamatPengiriman } from './AlamatForm';

export type ModeFormAlamat = '' | 'tambah' | 'ubah';
export type { AlamatPengiriman };
export type AlamatData = AlamatPengiriman;
export type AlamatList = AlamatPengiriman[];

export interface AkunAlamatProps {
  form?: ModeFormAlamat;
  daftarAlamat?: AlamatPengiriman[];
  alamatList?: AlamatPengiriman[];
  idAlamatUtama?: string;
  onBukaTambah?: () => void;
  onBukaUbah?: (alamat: AlamatPengiriman) => void;
  onJadikanUtama?: (id: string) => Promise<void> | void;
  onSetUtama?: (id: string) => Promise<void> | void;
  onHapus?: (id: string) => Promise<void> | void;
  onTambah?: () => void;
  onUbah?: (alamat: AlamatPengiriman) => void;
  onSimpanForm?: (data: Partial<AlamatPengiriman>) => Promise<void> | void;
  onTutupForm?: () => void;
  className?: string;
}

const DEFAULT_ALAMAT: AlamatPengiriman[] = [
  {
    id: 'warung',
    label: 'Warung Dewi',
    penerima: 'Dewi Lestari · 0812-3456-7890',
    jalan: 'Jl. Cigadung Raya Timur No. 18, RT 03/RW 07',
    area: 'Cigadung, Cibeunying Kaler, Kota Bandung, Jawa Barat 40191',
    patokan: 'depan Masjid Al-Ikhlas, pagar hijau',
    pin: true,
    isUtama: true,
  },
  {
    id: 'rumah',
    label: 'Rumah',
    penerima: 'Dewi Lestari · 0812-3456-7890',
    jalan: 'Komplek Bumi Panyileukan Blok F2 No. 7',
    area: 'Cipadung Kidul, Panyileukan, Kota Bandung, Jawa Barat 40614',
    patokan: '',
    pin: false,
    isUtama: false,
  },
];

export function AkunAlamat({
  form: formProp,
  daftarAlamat = DEFAULT_ALAMAT,
  alamatList,
  idAlamatUtama = 'warung',
  onBukaTambah,
  onBukaUbah,
  onJadikanUtama,
  onSetUtama,
  onHapus,
  onTambah,
  onUbah,
  onSimpanForm,
  onTutupForm,
  className = '',
}: AkunAlamatProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

  const alamatAktif = alamatList ?? daftarAlamat ?? DEFAULT_ALAMAT;

  const [form, setForm] = useState<ModeFormAlamat>(formProp ?? '');
  const [daftarState, setDaftarState] = useState<AlamatPengiriman[]>(alamatAktif);
  const [utamaId, setUtamaId] = useState<string>(idAlamatUtama);
  const [hapusTargetId, setHapusTargetId] = useState<string>('');
  const [pesan, setPesan] = useState<string>('');
  const [editAlamat, setEditAlamat] = useState<AlamatPengiriman | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === 'undefined' || !window.ResizeObserver) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSempit(entry.contentRect.width < 900);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sort address list prioritizing primary address: [...alamatList].sort(...)
  const sortedAlamat = [...daftarState].sort((a, b) =>
    a.id === utamaId ? -1 : b.id === utamaId ? 1 : 0
  );

  const handleBukaTambah = () => {
    setEditAlamat(null);
    setForm('tambah');
    setPesan('');
    onBukaTambah?.();
    onTambah?.();
  };

  const handleBukaUbah = (item: AlamatPengiriman) => {
    setEditAlamat(item);
    setForm('ubah');
    setPesan('');
    onBukaUbah?.(item);
    onUbah?.(item);
  };

  const handleTutupForm = () => {
    setForm('');
    setEditAlamat(null);
    onTutupForm?.();
  };

  const handleSimpanForm = async (data: Partial<AlamatPengiriman>) => {
    if (form === 'ubah' && editAlamat) {
      setDaftarState((prev) =>
        prev.map((a) => (a.id === editAlamat.id ? { ...a, ...data } : a))
      );
      setPesan('Alamat diperbarui.');
    } else {
      const newId = `alamat-${Date.now()}`;
      const newAddress: AlamatPengiriman = {
        id: newId,
        label: data.label ?? 'Alamat Baru',
        penerima: data.penerima ?? 'Dewi Lestari · 0812-3456-7890',
        jalan: data.jalan ?? '',
        area: data.area ?? '',
        patokan: data.patokan,
        pin: Boolean(data.pin),
        isUtama: Boolean(data.isUtama),
      };
      setDaftarState((prev) => [...prev, newAddress]);
      if (data.isUtama) {
        setUtamaId(newId);
      }
      setPesan('Alamat disimpan.');
    }
    setForm('');
    setEditAlamat(null);
    if (onSimpanForm) {
      await onSimpanForm(data);
    }
  };

  const handleSetUtama = async (id: string, label: string) => {
    setUtamaId(id);
    setPesan(`${label} sekarang alamat utama.`);
    if (onJadikanUtama) await onJadikanUtama(id);
    if (onSetUtama) await onSetUtama(id);
  };

  const handleHapus = async (id: string, label: string) => {
    setDaftarState((prev) => prev.filter((a) => a.id !== id));
    setHapusTargetId('');
    setPesan(`Alamat ${label} dihapus.`);
    if (onHapus) await onHapus(id);
  };

  const tampilDaftar = sempit ? form === '' : true;
  const formHalaman = sempit && form !== '';
  const formDialog = !sempit && form !== '';

  return (
    <div
      ref={rootRef}
      className={`relative min-h-full bg-cream font-sans text-ink ${className}`}
    >
      <SiteHeader active="beranda" signedIn={true} cartCount={0} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 min-[900px]:px-6 min-[900px]:py-7 min-[900px]:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar */}
          {!sempit && (
            <div className="flex-[0_0_272px] min-w-0">
              <AkunMenu aktif="alamat" />
            </div>
          )}

          {/* Main Content Column */}
          <div className="flex-[999_1_560px] min-w-0 max-w-[820px] flex flex-col gap-3.5">
            {tampilDaftar && (
              <>
                {sempit && (
                  <Link
                    href="/akun"
                    className="self-start inline-flex items-center gap-1 min-h-9 text-[#157a4c] text-sm font-bold no-underline hover:underline"
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
                    Akun
                  </Link>
                )}

                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                      Alamat pengiriman
                    </h1>
                    <p className="mt-1.5 text-sm text-[#5a6b60]">
                      Alamat utama dipilih otomatis saat checkout. Bisa diganti
                      per pesanan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBukaTambah}
                    className="inline-flex items-center gap-2 min-h-12 px-4.5 border-0 rounded-xl bg-brand-900 text-white text-[15px] font-extrabold cursor-pointer hover:bg-brand-600"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Tambah alamat
                  </button>
                </div>

                {pesan && (
                  <p
                    aria-live="polite"
                    className="m-0 text-sm font-bold text-[#157a4c]"
                  >
                    {pesan}
                  </p>
                )}

                {/* List of addresses */}
                <ul className="list-none m-0 p-0 flex flex-col gap-3">
                  {sortedAlamat.map((a) => {
                    const isUtama = a.id === utamaId;
                    return (
                      <li
                        key={a.id}
                        className={`p-4 px-4.5 rounded-2xl bg-white flex flex-col gap-2.5 ${
                          isUtama
                            ? 'border-[1.5px] border-brand-900'
                            : 'border border-line'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-base font-extrabold text-ink">
                            {a.label}
                          </strong>
                          {isUtama && (
                            <span className="px-2 py-px rounded-full bg-brand-900 text-white text-xs font-bold">
                              Utama
                            </span>
                          )}
                        </div>

                        <div className="text-sm leading-[1.55]">
                          <p className="m-0 text-ink">{a.penerima}</p>
                          <p className="m-0 text-[#3f5247]">{a.jalan}</p>
                          <p className="m-0 text-[#3f5247]">{a.area}</p>
                          {a.patokan && (
                            <p className="m-0 text-[#3f5247]">
                              Patokan: {a.patokan}
                            </p>
                          )}
                        </div>

                        <p
                          className={`m-0 inline-flex items-center gap-1.5 text-[13px] font-bold ${
                            a.pin ? 'text-[#157a4c]' : 'text-[#92400e]'
                          }`}
                        >
                          {a.pin ? (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" x2="12" y1="8" y2="12" />
                              <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                          )}
                          {a.pin
                            ? 'Titik lokasi terpasang. Kurir instan tersedia.'
                            : 'Belum ada titik lokasi. Kurir instan belum tersedia.'}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2.5 border-t border-[#eef0eb]">
                          <button
                            type="button"
                            onClick={() => handleBukaUbah(a)}
                            className="min-h-10 px-3.5 border border-line rounded-xl bg-white text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-cream"
                          >
                            Ubah
                          </button>
                          {!isUtama && (
                            <button
                              type="button"
                              onClick={() => handleSetUtama(a.id, a.label)}
                              className="min-h-10 px-3.5 border border-line rounded-xl bg-white text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-cream"
                            >
                              Jadikan utama
                            </button>
                          )}
                          {!a.pin && (
                            <button
                              type="button"
                              onClick={() => handleBukaUbah(a)}
                              className="min-h-10 px-3.5 border border-line rounded-xl bg-white text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-cream"
                            >
                              Pasang titik
                            </button>
                          )}
                          {!isUtama && (
                            <button
                              type="button"
                              onClick={() => setHapusTargetId(a.id)}
                              className="ml-auto min-h-10 px-3 border-0 rounded-xl bg-transparent text-danger text-sm font-bold cursor-pointer hover:bg-danger-bg"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        {/* Inline Deletion Confirmation */}
                        {hapusTargetId === a.id && (
                          <div
                            role="group"
                            aria-label="Konfirmasi hapus alamat"
                            className="flex flex-wrap items-center gap-2 p-3 px-3.5 rounded-xl bg-danger-bg"
                          >
                            <span className="flex-[1_1_200px] text-sm text-danger-ink font-bold">
                              Hapus alamat {a.label}? Pesanan lama tidak
                              terpengaruh.
                            </span>
                            <button
                              type="button"
                              onClick={() => handleHapus(a.id, a.label)}
                              className="min-h-10 px-3.5 border-0 rounded-xl bg-danger text-white text-sm font-extrabold cursor-pointer hover:bg-red-700"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setHapusTargetId('')}
                              className="min-h-10 px-3.5 border border-danger-line rounded-xl bg-white text-ink text-sm font-bold cursor-pointer hover:bg-cream"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <p className="m-0 flex gap-2 text-[13px] leading-[1.5] text-[#5a6b60]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span>
                    Pasok Tani saat ini mengirim ke seluruh Jawa Barat. Alamat
                    di luar Jawa Barat belum bisa dipakai.
                  </span>
                </p>
              </>
            )}

            {/* Mobile Form Replacement (<900px) */}
            {formHalaman && (
              <>
                <button
                  type="button"
                  onClick={handleTutupForm}
                  className="self-start inline-flex items-center gap-1 min-h-9 p-0 border-0 bg-transparent text-[#157a4c] text-sm font-bold cursor-pointer hover:underline"
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
                  Alamat pengiriman
                </button>
                <div className="p-4 px-4.5 border border-line rounded-2xl bg-white">
                  <AlamatForm
                    mode={form}
                    alamatAwal={editAlamat ?? undefined}
                    onTutup={handleTutupForm}
                    onSimpan={handleSimpanForm}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {!sempit && <SiteFooter />}

      {/* Desktop Modal Dialog Form (>=900px) */}
      {formDialog && (
        <div className="fixed inset-0 z-50 bg-[rgba(23,59,43,0.5)] flex justify-center items-start p-4 pt-24 box-border overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={form === 'ubah' ? 'Ubah alamat' : 'Tambah alamat'}
            className="w-full max-w-[600px] box-border p-6 rounded-2xl bg-white shadow-[0_24px_48px_rgba(6,78,59,0.24)]"
          >
            <AlamatForm
              mode={form}
              alamatAwal={editAlamat ?? undefined}
              onTutup={handleTutupForm}
              onSimpan={handleSimpanForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AkunAlamat;
