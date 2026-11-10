"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { kelasTombolSitus } from "./tombol";
import { IkonKeranjang } from "./ikon";

type Menu = "belanja" | "solusi" | "fitur";

const KATEGORI = ["Sayuran", "Buah", "Bumbu & Rempah", "Beras & Biji-bijian", "Umbi-umbian", "Jamur"];

const BARU = [
  { nama: "Tomat Merah Lembang", harga: "Rp14.000/kg", foto: "/images/landingpage/petani/petani-petik-cabai.png" },
  { nama: "Pakcoy Hidroponik", harga: "Rp22.000/kg", foto: "/images/landingpage/lahan/padi-tumbuh.png" },
  { nama: "Cabai Merah Keriting", harga: "Rp42.000/kg", foto: "/images/landingpage/komoditas/cabai-rawit.png" },
];

const SOLUSI = [
  { judul: "Rumah tangga", isi: "Belanja dapur harian, tanggal panen di setiap produk.", href: "/belanja", foto: "/images/landingpage/hero/Padi.png" },
  { judul: "UMKM & usaha kuliner", isi: "Keranjang Resep dan harga grosir otomatis.", href: "/daftar/pembeli", foto: "/images/landingpage/umkm/warung-makan.png" },
  { judul: "Petani", isi: "Daftar gratis, terima Komitmen sebelum panen.", href: "/daftar/petani", foto: "/images/landingpage/petani/petani-genggam-padi.png" },
];

const FITUR = [
  { judul: "Foto stok asli", isi: "Foto stok yang dijual, bertanggal panen." },
  { judul: "Komitmen pra-panen", isi: "Amankan stok sebelum panen tiba." },
  { judul: "Keranjang Resep", isi: "Bahan per menu, pesan ulang mingguan." },
  { judul: "Diskon Surplus", isi: "Diskon bertingkat, kurangi pangan terbuang." },
  { judul: "Lencana petani", isi: "Tanda petani terverifikasi dan andal." },
  { judul: "Langganan produk", isi: "Kabar stok baru atau harga turun." },
  { judul: "Pembayaran aman", isi: "Dana ditahan sampai pesanan diterima." },
  { judul: "Pengiriman", isi: "Kurir, antar sendiri, atau ambil di lahan." },
];

const BELANJA_JELAJAH = [
  { judul: "Produk Surplus", isi: "Diskon menjelang batas jual", href: "/surplus" },
  { judul: "Daftar Tunggu", isi: "Pesan sebelum panen", href: "/daftar-tunggu" },
  { judul: "Direktori petani", isi: "Profil, lencana, dan ulasan", href: "/petani" },
];

/**
 * Keadaan masuk untuk header. `null` berarti tamu (tombol Masuk dan Daftar tampil). Untuk orang yang sudah masuk,
 * `keranjang` berisi jumlah barang di Keranjang Sementara; `null` bila akunnya bukan pembeli.
 */
export type SesiHeader = { keranjang: number | null };

function TautanKeranjang({ jumlah, kelas, ikon }: { jumlah: number; kelas: string; ikon: number }) {
  return (
    <Link href="/keranjang" className={kelas} aria-label={jumlah > 0 ? `Keranjang, ${jumlah} barang` : "Keranjang"}>
      <IkonKeranjang size={ikon} />
      Keranjang
      {jumlah > 0 && (
        <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] leading-5 font-bold text-white">
          {jumlah}
        </span>
      )}
    </Link>
  );
}

const MENU_ID: Record<Menu, string> = { belanja: "menu-belanja", solusi: "menu-solusi", fitur: "menu-fitur" };
const LABEL: Record<Menu, string> = { belanja: "Belanja", solusi: "Solusi", fitur: "Fitur" };

function Panah({ ukuran = 16 }: { ukuran?: number }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function Chevron({ ukuran = 16, className = "" }: { ukuran?: number; className?: string }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 transition-transform duration-200 ${className}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function LogoSitus() {
  return (
    <Link href="/" aria-label="Pasok Tani, ke beranda" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap no-underline">
      <Image src="/images/logo/color-logo-pasoktani.png" alt="" width={40} height={37} priority className="h-9 w-auto" />
      <span className="text-[22px] font-extrabold tracking-[-0.02em] text-brand-900" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        Pasok<span className="text-[#a8862a]">Tani</span>
      </span>
    </Link>
  );
}

function Pemicu({ id, buka, onKlik }: { id: Menu; buka: Menu | null; onKlik: (id: Menu) => void }) {
  const terbuka = buka === id;
  return (
    <button
      type="button"
      data-pemicu={id}
      aria-expanded={terbuka}
      aria-controls={MENU_ID[id]}
      onClick={() => onKlik(id)}
      className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent py-0 pr-3 pl-3.5 text-[15px] font-semibold text-ink transition-colors duration-150 hover:bg-tint aria-expanded:bg-tint"
    >
      {LABEL[id]}
      <Chevron className={terbuka ? "rotate-180" : ""} />
    </button>
  );
}

function Panel({ id, buka, kelas, children }: { id: Menu; buka: Menu | null; kelas: string; children: React.ReactNode }) {
  return (
    <div
      id={MENU_ID[id]}
      data-buka={buka === id ? "ya" : "tidak"}
      className={`invisible absolute top-full left-1/2 z-40 -translate-x-1/2 pt-5 opacity-0 transition duration-150 data-[buka=ya]:visible data-[buka=ya]:opacity-100 ${kelas}`}
    >
      {children}
    </div>
  );
}

export function HeaderSitus({ sesi = null }: { sesi?: SesiHeader | null }) {
  const [buka, setBuka] = useState<Menu | null>(null);
  const [laci, setLaci] = useState(false);
  const [bagian, setBagian] = useState<Menu | null>("belanja");
  const akar = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const waktuHover = useRef(0);

  useEffect(() => {
    const diLuar = (e: PointerEvent) => {
      if (akar.current && !akar.current.contains(e.target as Node)) {
        clearTimeout(timer.current);
        setBuka(null);
        setLaci(false);
      }
    };
    const tekanEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (buka || laci) {
        const id = buka;
        clearTimeout(timer.current);
        setBuka(null);
        setLaci(false);
        const sel = id ? `[data-pemicu="${id}"]` : '[data-pemicu="laci"]';
        (akar.current?.querySelector(sel) as HTMLElement | null)?.focus();
      }
    };
    document.addEventListener("pointerdown", diLuar);
    document.addEventListener("keydown", tekanEsc);
    return () => {
      document.removeEventListener("pointerdown", diLuar);
      document.removeEventListener("keydown", tekanEsc);
      clearTimeout(timer.current);
    };
  }, [buka, laci]);

  function masuk(id: Menu) {
    clearTimeout(timer.current);
    const tunda = buka ? (buka === id ? 0 : 120) : 200;
    timer.current = setTimeout(() => {
      if (buka !== id) waktuHover.current = Date.now();
      setBuka(id);
    }, tunda);
  }

  function keluar() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBuka(null), 300);
  }

  function toggle(id: Menu) {
    clearTimeout(timer.current);
    if (buka === id && Date.now() - waktuHover.current < 500) return;
    setBuka((s) => (s === id ? null : id));
  }

  const kartuKiri = "flex items-center gap-3.5 rounded-2xl p-2.5 text-ink no-underline transition-colors hover:bg-[#f2f6f0]";

  return (
    <header ref={akar} className="relative z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-21 max-w-[1280px] items-center gap-3 px-5 md:px-10">
        <LogoSitus />

        <nav aria-label="Navigasi utama" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-0.5 text-[15px] font-semibold">
            <li className="static" onMouseEnter={() => masuk("belanja")} onMouseLeave={keluar}>
              <Pemicu id="belanja" buka={buka} onKlik={toggle} />
              <Panel id="belanja" buka={buka} kelas="w-[min(900px,calc(100vw-40px))]">
                <div className="grid grid-cols-[1.3fr_1fr_0.95fr] gap-5 rounded-3xl border border-line bg-white p-5 shadow-[0_24px_60px_rgba(16,41,30,0.16)]">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-extrabold tracking-[0.08em] text-[#5a6b60] uppercase">Kategori</p>
                    <ul className="grid grid-cols-2 gap-0.5">
                      {KATEGORI.map((k) => (
                        <li key={k}>
                          <Link href="/kategori" className="flex min-h-12 items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-ink no-underline hover:bg-[#f2f6f0]">
                            <span className="size-8.5 shrink-0 rounded-[10px] bg-tint" aria-hidden="true" />
                            {k}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-extrabold tracking-[0.08em] text-[#5a6b60] uppercase">Jelajahi</p>
                    <ul className="flex flex-col gap-0.5">
                      {BELANJA_JELAJAH.map((j) => (
                        <li key={j.judul}>
                          <Link href={j.href} className="flex gap-3 rounded-xl p-2.5 text-ink no-underline hover:bg-[#f2f6f0]">
                            <span className="min-w-0">
                              <span className="block text-sm font-bold">{j.judul}</span>
                              <span className="block text-[13px] leading-snug text-[#4d5f54]">{j.isi}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5 rounded-[18px] bg-[#f6f4ec] p-4">
                    <p className="mb-2 text-xs font-extrabold tracking-[0.08em] text-[#5a6b60] uppercase">Baru dipanen</p>
                    <ul className="flex flex-col gap-0.5">
                      {BARU.map((b) => (
                        <li key={b.nama}>
                          <Link href="/produk" className="flex items-center gap-2.5 rounded-xl p-1.5 text-ink no-underline hover:bg-[#f2f6f0]">
                            <Image src={b.foto} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[10px] object-cover" />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-bold">{b.nama}</span>
                              <span className="block text-[13px] font-extrabold text-brand-900">{b.harga}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/produk" className="mt-auto inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-brand-900 no-underline">
                      Lihat semua <Panah />
                    </Link>
                  </div>
                </div>
              </Panel>
            </li>

            <li className="relative" onMouseEnter={() => masuk("solusi")} onMouseLeave={keluar}>
              <Pemicu id="solusi" buka={buka} onKlik={toggle} />
              <Panel id="solusi" buka={buka} kelas="w-[560px] -translate-x-1/2">
                <div className="rounded-3xl border border-line bg-white p-2.5 shadow-[0_24px_60px_rgba(16,41,30,0.16)]">
                  <ul className="flex flex-col gap-0.5">
                    {SOLUSI.map((s) => (
                      <li key={s.judul}>
                        <Link href={s.href} className={`${kartuKiri} gap-3.5 rounded-2xl p-2.5`}>
                          <Image src={s.foto} alt="" width={56} height={56} className="size-14 shrink-0 rounded-[14px] object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-extrabold">{s.judul}</span>
                            <span className="block text-[13px] leading-snug text-[#4d5f54]">{s.isi}</span>
                          </span>
                          <Panah ukuran={18} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mx-2.5 mt-1.5 border-t border-line pt-2.5 pb-1">
                    <Link href="/cara-kerja" className="inline-flex min-h-9 items-center gap-1.5 text-sm font-bold text-brand-900 no-underline">
                      Belum yakin? Lihat cara kerjanya <Panah />
                    </Link>
                  </div>
                </div>
              </Panel>
            </li>

            <li className="relative" onMouseEnter={() => masuk("fitur")} onMouseLeave={keluar}>
              <Pemicu id="fitur" buka={buka} onKlik={toggle} />
              <Panel id="fitur" buka={buka} kelas="w-[640px] -translate-x-1/2">
                <div className="rounded-3xl border border-line bg-white p-3 shadow-[0_24px_60px_rgba(16,41,30,0.16)]">
                  <ul className="grid grid-cols-2 gap-0.5">
                    {FITUR.map((f) => (
                      <li key={f.judul}>
                        <Link href="/cara-kerja" className="flex gap-3 rounded-xl p-2.5 text-ink no-underline hover:bg-[#f2f6f0]">
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{f.judul}</span>
                            <span className="block text-[13px] leading-snug text-[#4d5f54]">{f.isi}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mx-2.5 mt-1.5 border-t border-line pt-2.5 pb-1">
                    <Link href="/cara-kerja" className="inline-flex min-h-9 items-center gap-1.5 text-sm font-bold text-brand-900 no-underline">
                      Lihat cara kerja lengkap <Panah />
                    </Link>
                  </div>
                </div>
              </Panel>
            </li>

            <li>
              <Link href="/cara-kerja" className="inline-flex h-11 items-center rounded-full px-3.5 text-ink no-underline hover:bg-tint">
                Cara Kerja
              </Link>
            </li>
            <li>
              <Link href="/tentang" className="inline-flex h-11 items-center rounded-full px-3.5 text-ink no-underline hover:bg-tint">
                Tentang
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {sesi ? (
            sesi.keranjang !== null && (
              <TautanKeranjang
                jumlah={sesi.keranjang}
                ikon={20}
                kelas="relative inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[15px] font-bold text-ink no-underline hover:bg-tint"
              />
            )
          ) : (
            <>
              <Link href="/masuk" className="hidden h-11 items-center px-3.5 text-[15px] font-bold text-ink no-underline sm:inline-flex">
                Masuk
              </Link>
              <Link href="/daftar" className={`${kelasTombolSitus("aksen")} whitespace-nowrap`}>
                Daftar
              </Link>
            </>
          )}
          <button
            type="button"
            data-pemicu="laci"
            aria-expanded={laci}
            aria-controls="laci-navigasi"
            aria-label={laci ? "Tutup menu" : "Buka menu"}
            onClick={() => {
              clearTimeout(timer.current);
              setBuka(null);
              setLaci((v) => !v);
            }}
            className="grid size-11.5 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink lg:hidden"
          >
            {laci ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        id="laci-navigasi"
        data-buka={laci ? "ya" : "tidak"}
        className="invisible absolute inset-x-0 top-full max-h-[calc(100vh-84px)] overflow-y-auto border-y border-line bg-white px-5 pt-1 pb-6 opacity-0 shadow-[0_24px_40px_rgba(16,41,30,0.12)] transition duration-150 data-[buka=ya]:visible data-[buka=ya]:opacity-100 lg:hidden"
      >
        <nav aria-label="Menu seluler">
          <ul>
            {(["belanja", "solusi", "fitur"] as Menu[]).map((id) => (
              <li key={id} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={bagian === id}
                  aria-controls={`laci-${id}`}
                  onClick={() => setBagian((s) => (s === id ? null : id))}
                  className="flex min-h-14 w-full items-center justify-between border-0 bg-transparent px-1 text-[17px] font-bold text-ink"
                >
                  {LABEL[id]}
                  <Chevron ukuran={20} className={bagian === id ? "rotate-180" : ""} />
                </button>
                <div id={`laci-${id}`} data-buka={bagian === id ? "ya" : "tidak"} className="hidden pb-3 data-[buka=ya]:block">
                  {id === "belanja" && (
                    <ul className="grid grid-cols-2 gap-x-3">
                      {KATEGORI.map((k) => (
                        <li key={k}>
                          <Link href="/kategori" className="flex min-h-11 items-center text-[15px] font-semibold text-ink no-underline">
                            {k}
                          </Link>
                        </li>
                      ))}
                      {BELANJA_JELAJAH.map((j) => (
                        <li key={j.judul} className="col-span-2">
                          <Link href={j.href} className="flex min-h-11 items-center text-[15px] font-semibold text-ink no-underline">
                            {j.judul}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {id === "solusi" && (
                    <ul>
                      {SOLUSI.map((s) => (
                        <li key={s.judul}>
                          <Link href={s.href} className="flex min-h-14 flex-col justify-center text-ink no-underline">
                            <span className="text-[15px] font-bold">{s.judul}</span>
                            <span className="text-[13px] text-[#4d5f54]">{s.isi}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {id === "fitur" && (
                    <ul className="grid grid-cols-2 gap-x-3">
                      {FITUR.map((f) => (
                        <li key={f.judul}>
                          <Link href="/cara-kerja" className="flex min-h-11 items-center text-[15px] font-semibold text-ink no-underline">
                            {f.judul}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
            <li className="border-b border-line">
              <Link href="/cara-kerja" className="flex min-h-14 items-center px-1 text-[17px] font-bold text-ink no-underline">
                Cara Kerja
              </Link>
            </li>
            <li>
              <Link href="/tentang" className="flex min-h-14 items-center px-1 text-[17px] font-bold text-ink no-underline">
                Tentang
              </Link>
            </li>
          </ul>
        </nav>
        {sesi ? (
          sesi.keranjang !== null && (
            <div className="mt-4 grid grid-cols-1">
              <TautanKeranjang
                jumlah={sesi.keranjang}
                ikon={20}
                kelas="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-900 text-base font-bold text-white no-underline"
              />
            </div>
          )
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link href="/masuk" className="flex h-12 items-center justify-center rounded-full border-[1.5px] border-brand-900 text-base font-bold text-brand-900 no-underline">
              Masuk
            </Link>
            <Link href="/daftar" className="flex h-12 items-center justify-center rounded-full bg-brand-900 text-base font-bold text-white no-underline">
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
