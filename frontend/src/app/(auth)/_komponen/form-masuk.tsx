"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { masuk, masukDenganGoogle } from "@/lib/auth-api";
import { bacaParam, pathAman } from "@/lib/url";
import { IkonGoogle } from "./ikon";
import { Kolom, KolomKataSandi, KolomTeks } from "./kolom";
import { Judul } from "./judul";
import { Peringatan } from "./peringatan";
import { kelasTombol } from "./tombol";

export function FormMasuk() {
  const router = useRouter();
  const refSandi = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [galat, setGalat] = useState(false);
  const [mengirim, setMengirim] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mengirim) return;
    setMengirim(true);
    const hasil = await masuk({ email: email.trim(), kataSandi });
    setMengirim(false);

    if (hasil.ok) {
      router.push(pathAman(bacaParam("lanjut")) ?? "/");
      return;
    }
    setGalat(true);
    setKataSandi("");
    refSandi.current?.focus();
  }

  return (
    <>
      <Judul judul="Masuk">Gunakan email atau akun Google yang kamu daftarkan.</Judul>

      <form onSubmit={kirim} className="flex flex-col gap-5">
        {galat && (
          <Peringatan>
            Email atau kata sandi salah. Coba lagi, atau{" "}
            <Link href="/lupa-sandi">atur ulang kata sandimu</Link>.
          </Peringatan>
        )}

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

        <Kolom id="kata-sandi" label="Kata sandi">
          <KolomKataSandi
            id="kata-sandi"
            ref={refSandi}
            required
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
            value={kataSandi}
            onChange={(e) => setKataSandi(e.target.value)}
          />
        </Kolom>

        <div className="-mt-2.5 flex justify-end">
          <Link
            href="/lupa-sandi"
            className="text-sm font-semibold text-brand-900 no-underline hover:underline"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <button type="submit" disabled={mengirim} className={kelasTombol("utama")}>
          Masuk
        </button>

        <div className="flex items-center gap-3 text-[13px] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
          atau
        </div>

        <button
          type="button"
          onClick={() => void masukDenganGoogle()}
          className={kelasTombol("google")}
        >
          <IkonGoogle />
          Masuk dengan Google
        </button>

        <p className="text-center text-[15px] text-muted">
          Belum punya akun?
          <Link href="/daftar" className="ml-1 font-bold text-brand-900 no-underline hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </form>
    </>
  );
}
