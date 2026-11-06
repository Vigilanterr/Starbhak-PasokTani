"use client";

import { useEffect, useState, type FormEvent } from "react";
import { mintaAturUlangKataSandi } from "@/lib/auth-api";
import { IkonSurat } from "./ikon";
import { Judul } from "./judul";
import { Kolom, KolomTeks } from "./kolom";
import { Catatan } from "./peringatan";
import { TautanKembali } from "./tautan-kembali";
import { kelasTombol } from "./tombol";

const JEDA_KIRIM_ULANG_DETIK = 60;

function formatWaktu(detik: number) {
  return `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, "0")}`;
}

export function FormLupaSandi() {
  const [tahap, setTahap] = useState<"isi" | "terkirim">("isi");
  const [email, setEmail] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [sisa, setSisa] = useState(0);

  useEffect(() => {
    if (sisa <= 0) return;
    const t = setTimeout(() => setSisa((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sisa]);

  async function kirimTautan() {
    if (mengirim) return;
    setMengirim(true);
    await mintaAturUlangKataSandi({ email: email.trim() });
    setMengirim(false);
    setTahap("terkirim");
    setSisa(JEDA_KIRIM_ULANG_DETIK);
  }

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void kirimTautan();
  }

  if (tahap === "terkirim") {
    return (
      <>
        <TautanKembali href="/masuk">Kembali ke Masuk</TautanKembali>

        <div className="grid size-14 place-items-center rounded-2xl bg-tint text-brand-900">
          <IkonSurat size={26} />
        </div>

        <Judul judul="Cek emailmu">
          Jika <span className="font-semibold text-ink">{email.trim()}</span> terdaftar,
          kami sudah mengirim tautan untuk mengatur ulang kata sandi. Tautan berlaku
          selama 30 menit.
        </Judul>

        {sisa > 0 ? (
          <button type="button" disabled className={kelasTombol("utama")}>
            Kirim ulang dalam&nbsp;<span aria-live="off">{formatWaktu(sisa)}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={mengirim}
            onClick={() => void kirimTautan()}
            className={kelasTombol("garis")}
          >
            Kirim ulang tautan
          </button>
        )}

        <Catatan>
          Tidak menemukan email? Periksa folder spam atau promosi. Salah alamat?{" "}
          <button type="button" onClick={() => setTahap("isi")}>
            Ganti email
          </button>
        </Catatan>
      </>
    );
  }

  return (
    <>
      <TautanKembali href="/masuk">Kembali ke Masuk</TautanKembali>

      <Judul judul="Lupa kata sandi?">
        Masukkan email akunmu. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
      </Judul>

      <form onSubmit={kirim} className="flex flex-col gap-5">
        <Kolom id="email" label="Email">
          <KolomTeks
            id="email"
            type="email"
            required
            placeholder="nama@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Kolom>
        <button type="submit" disabled={mengirim} className={kelasTombol("utama")}>
          Kirim tautan
        </button>
      </form>
    </>
  );
}
