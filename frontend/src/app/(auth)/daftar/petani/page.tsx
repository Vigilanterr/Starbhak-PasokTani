import type { Metadata } from "next";
import { FormDaftar } from "../../_komponen/form-daftar";
import { Judul } from "../../_komponen/judul";
import { TautanKembali } from "../../_komponen/tautan-kembali";

export const metadata: Metadata = { title: "Daftar sebagai petani" };

export default function Page() {
  return (
    <>
      <TautanKembali href="/daftar">Ganti peran</TautanKembali>
      <Judul judul="Buat akun petani">Jual hasil panen langsung ke UMKM dan pasar.</Judul>
      <FormDaftar peran="petani" />
    </>
  );
}
