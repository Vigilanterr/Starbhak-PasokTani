"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { aturUlangKataSandi } from "@/lib/auth-api";
import { periksaKataSandi } from "@/lib/kata-sandi";
import { bacaParam } from "@/lib/url";
import { Aturan, DaftarAturan } from "./aturan";
import { Judul } from "./judul";
import { Kolom, KolomKataSandi } from "./kolom";
import { Peringatan } from "./peringatan";
import { kelasTombol } from "./tombol";

export function FormAturUlang() {
  const router = useRouter();
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<"token" | "gagal" | null>(null);

  const { panjang, campuran } = periksaKataSandi(baru);
  const sama = baru.length > 0 && baru === ulang;
  const valid = panjang && campuran && sama;

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || mengirim) return;

    // Token datang dari tautan email: /atur-ulang-sandi?token=...
    const token = bacaParam("token");
    if (!token) {
      setGalat("token");
      return;
    }

    setMengirim(true);
    const hasil = await aturUlangKataSandi({ token, kataSandi: baru });
    setMengirim(false);

    if (hasil.ok) {
      router.push("/masuk");
      return;
    }
    setGalat("token");
  }

  return (
    <>
      <Judul judul="Atur ulang kata sandi">Buat kata sandi baru untuk akunmu.</Judul>

      <form onSubmit={kirim} className="flex flex-col gap-5">
        {galat && (
          <Peringatan>
            Tautan atur ulang tidak valid atau sudah kedaluwarsa.{" "}
            <Link href="/lupa-sandi">Minta tautan baru</Link>.
          </Peringatan>
        )}

        <div className="flex flex-col gap-3">
          <Kolom id="kata-sandi-baru" label="Kata sandi baru">
            <KolomKataSandi
              id="kata-sandi-baru"
              placeholder="Buat kata sandi baru"
              autoComplete="new-password"
              value={baru}
              onChange={(e) => setBaru(e.target.value)}
            />
          </Kolom>
          <DaftarAturan>
            <Aturan terpenuhi={panjang}>Minimal 8 karakter</Aturan>
            <Aturan terpenuhi={campuran}>Mengandung huruf dan angka</Aturan>
          </DaftarAturan>
        </div>

        <div className="flex flex-col gap-3">
          <Kolom id="konfirmasi" label="Konfirmasi kata sandi">
            <KolomKataSandi
              id="konfirmasi"
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              value={ulang}
              onChange={(e) => setUlang(e.target.value)}
            />
          </Kolom>
          <DaftarAturan>
            <Aturan terpenuhi={sama}>Kedua kata sandi sama</Aturan>
          </DaftarAturan>
        </div>

        <button type="submit" disabled={!valid || mengirim} className={kelasTombol("utama")}>
          Simpan kata sandi
        </button>
      </form>
    </>
  );
}
