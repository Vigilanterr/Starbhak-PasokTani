import type { Metadata } from "next";
import { FormDaftar } from "../../_komponen/form-daftar";
import { Judul } from "../../_komponen/judul";
import { TautanKembali } from "../../_komponen/tautan-kembali";

export const metadata: Metadata = { title: "Daftar sebagai pembeli" };

export default function Page() {
  return (
    <>
      <TautanKembali href="/daftar">Ganti peran</TautanKembali>
      <Judul judul="Buat akun pembeli">Pilih peranmu, lalu isi data singkat di bawah.</Judul>
      <FormDaftar peran="pembeli" />
    </>
  );
}
