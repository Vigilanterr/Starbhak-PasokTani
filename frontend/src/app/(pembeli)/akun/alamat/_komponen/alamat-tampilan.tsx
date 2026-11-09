"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Bantuan, Kolom, KolomPilihan, KolomTeks } from "@/app/(auth)/_komponen/kolom";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { kirimPembeli, type Galat } from "@/lib/api/pembeli";
import type { Alamat } from "@/lib/api/tipe";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";

type Isian = "label" | "namaPenerima" | "telepon" | "kabupaten" | "kecamatan" | "jalan" | "kodePos" | "catatan";

const KOSONG: Record<Isian, string> = {
  label: "Rumah",
  namaPenerima: "",
  telepon: "",
  kabupaten: "",
  kecamatan: "",
  jalan: "",
  kodePos: "",
  catatan: "",
};

const kelasArea =
  "w-full resize-y rounded-[10px] border border-field-border bg-white px-4 py-3 text-[15px] text-ink outline-none placeholder:text-placeholder focus-visible:border-brand-900";

/** Buku alamat: daftar, tandai utama, dan tambah alamat baru. Isian dan galat per kolom, seperti formulir daftar. */
export function AlamatTampilan({ daftar }: { daftar: Alamat[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<Isian, string>>(KOSONG);
  const [utama, setUtama] = useState(false);
  const [galat, setGalat] = useState<Partial<Record<Isian | "umum", string>>>({});
  const [mengirim, setMengirim] = useState(false);
  const [sibuk, setSibuk] = useState<string | null>(null);

  const ubah = (kunci: Isian) => (nilai: string) => {
    setForm((f) => ({ ...f, [kunci]: nilai }));
    if (galat[kunci]) setGalat((g) => ({ ...g, [kunci]: undefined }));
  };

  /** Galat dari backend ke kolom yang bersangkutan. Galat tanpa kolom tampil di atas formulir. */
  function pasangGalat(g: Galat) {
    const fields = g.fields ?? {};
    const hasil: Partial<Record<Isian | "umum", string>> = {};
    for (const [kunci, pesan] of Object.entries(fields)) {
      if (kunci in KOSONG) hasil[kunci as Isian] = pesan;
    }
    if (Object.keys(hasil).length === 0) hasil.umum = g.pesan;
    setGalat(hasil);
  }

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mengirim) return;
    setMengirim(true);
    setGalat({});
    const hasil = await kirimPembeli<Alamat[]>("POST", "/me/alamat", {
      label: form.label,
      namaPenerima: form.namaPenerima,
      telepon: form.telepon,
      kabupaten: form.kabupaten,
      kecamatan: form.kecamatan,
      jalan: form.jalan,
      kodePos: form.kodePos.trim() || null,
      catatan: form.catatan.trim() || null,
      utama,
    });
    setMengirim(false);
    if (!hasil.ok) return pasangGalat(hasil);
    setForm(KOSONG);
    setUtama(false);
    router.refresh();
  }

  async function jadikanUtama(alamat: Alamat) {
    setSibuk(alamat.id);
    const hasil = await kirimPembeli<Alamat[]>("POST", `/me/alamat/${alamat.id}/utama`);
    setSibuk(null);
    if (!hasil.ok) return setGalat({ umum: hasil.pesan });
    router.refresh();
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Alamat pengiriman</h1>
          <p className="mt-1 text-sm text-muted">Alamat utama dipakai saat checkout.</p>
        </header>

        {daftar.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-white p-5 text-[15px] text-muted">
            Belum ada alamat. Tambahkan satu alamat sebelum checkout pertama.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {daftar.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {a.label}
                    {a.utama && (
                      <span className="ml-2 rounded-full bg-mint px-2 py-0.5 align-middle text-[11px] font-semibold text-brand-900">Utama</span>
                    )}
                  </p>
                  <p className="text-[15px] text-ink">{a.namaPenerima} · {a.telepon}</p>
                  <p className="text-[14px] leading-relaxed text-muted">
                    {a.jalan}, Kec. {a.kecamatan}, {a.namaKabupaten}
                    {a.kodePos ? ` ${a.kodePos}` : ""}
                  </p>
                  {a.catatan && <p className="text-[13px] text-muted">Catatan: {a.catatan}</p>}
                </div>
                {!a.utama && (
                  <button
                    type="button"
                    onClick={() => jadikanUtama(a)}
                    disabled={sibuk === a.id}
                    className="shrink-0 text-[13px] font-semibold text-brand-600 underline-offset-3 hover:text-brand-900 hover:underline disabled:opacity-50"
                  >
                    Jadikan utama
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {galat.umum && <p role="alert" className="text-[13px] font-medium text-danger">{galat.umum}</p>}
      </div>

      <form onSubmit={kirim} noValidate className="flex h-fit flex-col gap-5 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold tracking-tight text-brand-900">Tambah alamat</h2>

        <Kolom id="label" label="Label" bantuan={galat.label && <Bantuan id="label-galat" galat>{galat.label}</Bantuan>}>
          <KolomTeks id="label" galat={!!galat.label} value={form.label} onChange={(e) => ubah("label")(e.target.value)} placeholder="Rumah, Warung, Kantor" />
        </Kolom>

        <Kolom id="namaPenerima" label="Nama penerima" bantuan={galat.namaPenerima && <Bantuan id="namaPenerima-galat" galat>{galat.namaPenerima}</Bantuan>}>
          <KolomTeks id="namaPenerima" galat={!!galat.namaPenerima} value={form.namaPenerima} onChange={(e) => ubah("namaPenerima")(e.target.value)} />
        </Kolom>

        <Kolom id="telepon" label="Nomor telepon" bantuan={galat.telepon && <Bantuan id="telepon-galat" galat>{galat.telepon}</Bantuan>}>
          <KolomTeks id="telepon" type="tel" galat={!!galat.telepon} value={form.telepon} onChange={(e) => ubah("telepon")(e.target.value)} placeholder="+6281234567890" />
        </Kolom>

        <Kolom id="kabupaten" label="Kabupaten / Kota (Jawa Barat)" bantuan={galat.kabupaten && <Bantuan id="kabupaten-galat" galat>{galat.kabupaten}</Bantuan>}>
          <KolomPilihan id="kabupaten" galat={!!galat.kabupaten} value={form.kabupaten} onChange={(e) => ubah("kabupaten")(e.target.value)}>
            <option value="">Pilih kabupaten atau kota</option>
            {WILAYAH_JAWA_BARAT.map((w) => (
              <option key={w.nilai} value={w.nilai}>{w.label}</option>
            ))}
          </KolomPilihan>
        </Kolom>

        <Kolom id="kecamatan" label="Kecamatan" bantuan={galat.kecamatan && <Bantuan id="kecamatan-galat" galat>{galat.kecamatan}</Bantuan>}>
          <KolomTeks id="kecamatan" galat={!!galat.kecamatan} value={form.kecamatan} onChange={(e) => ubah("kecamatan")(e.target.value)} placeholder="Contoh: Lembang" />
        </Kolom>

        <Kolom id="jalan" label="Alamat lengkap" bantuan={galat.jalan && <Bantuan id="jalan-galat" galat>{galat.jalan}</Bantuan>}>
          <textarea id="jalan" rows={3} className={kelasArea} value={form.jalan} onChange={(e) => ubah("jalan")(e.target.value)} aria-invalid={!!galat.jalan || undefined} />
        </Kolom>

        <Kolom id="kodePos" label="Kode pos (opsional)" bantuan={galat.kodePos && <Bantuan id="kodePos-galat" galat>{galat.kodePos}</Bantuan>}>
          <KolomTeks id="kodePos" inputMode="numeric" galat={!!galat.kodePos} value={form.kodePos} onChange={(e) => ubah("kodePos")(e.target.value)} placeholder="40391" />
        </Kolom>

        <label className="flex items-center gap-2.5 text-[15px] text-ink">
          <input type="checkbox" checked={utama} onChange={(e) => setUtama(e.target.checked)} className="size-4 accent-brand-900" />
          Jadikan alamat utama
        </label>

        <button type="submit" disabled={mengirim} className={`${kelasTombolSitus("utama")} disabled:cursor-wait disabled:opacity-70`}>
          {mengirim ? "Menyimpan…" : "Simpan alamat"}
        </button>
      </form>
    </section>
  );
}
