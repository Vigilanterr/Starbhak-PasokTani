"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { daftar, masukDenganGoogle } from "@/lib/auth-api";
import { kataSandiValid } from "@/lib/kata-sandi";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";
import { IkonGoogle } from "./ikon";
import { Bantuan, Kolom, KolomKataSandi, KolomPilihan, KolomTeks } from "./kolom";
import { Peringatan } from "./peringatan";
import { PilihPeran } from "./pilih-peran";
import { kelasTombol } from "./tombol";

type Jenis = "konsumen" | "umkm";
type Kunci = "nama" | "email" | "kataSandi" | "namaToko" | "wilayah" | "kecamatan";
type Galat = Partial<Record<Kunci, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OPSI_PEMBELI = [
  {
    nilai: "konsumen",
    label: "Saya Konsumen",
    petunjuk: "Konsumen: belanja hasil panen segar langsung dari petani.",
  },
  {
    nilai: "umkm",
    label: "Saya UMKM",
    petunjuk: "UMKM: beli pasokan langsung dari petani untuk usahamu.",
  },
] as const;

export function FormDaftar({ peran }: { peran: "pembeli" | "petani" }) {
  const router = useRouter();
  const [jenis, setJenis] = useState<Jenis>("konsumen");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [namaToko, setNamaToko] = useState("");
  const [wilayah, setWilayah] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [galat, setGalat] = useState<Galat>({});
  const [gagal, setGagal] = useState(false);
  const [mengirim, setMengirim] = useState(false);

  const petani = peran === "petani";

  /** Setter yang sekaligus menghapus galat kolom tersebut saat pengguna mengetik. */
  const ubah = (kunci: Kunci, set: (v: string) => void) => (v: string) => {
    set(v);
    setGalat((g) => ({ ...g, [kunci]: undefined }));
  };

  function periksa(): Galat {
    const g: Galat = {};
    if (!nama.trim()) g.nama = "Nama lengkap wajib diisi.";
    if (!EMAIL.test(email.trim())) g.email = "Masukkan email yang valid, contoh: nama@email.com.";
    if (!kataSandiValid(kataSandi)) g.kataSandi = "Minimal 8 karakter, gabungan huruf dan angka.";
    if (petani) {
      if (!namaToko.trim()) g.namaToko = "Nama toko atau kebun wajib diisi.";
      if (!wilayah) g.wilayah = "Pilih kabupaten atau kota.";
      if (!kecamatan.trim()) g.kecamatan = "Kecamatan wajib diisi.";
    }
    return g;
  }

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mengirim) return;
    const g = periksa();
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setMengirim(true);
    setGagal(false);
    const hasil = await daftar({
      peran: petani ? "petani" : jenis,
      nama: nama.trim(),
      email: email.trim(),
      kataSandi,
      ...(petani ? { namaToko: namaToko.trim(), wilayah, kecamatan: kecamatan.trim() } : {}),
    });
    setMengirim(false);

    // Gerbang profil memutuskan tujuannya: profil sudah dibuat -> beranda, belum -> formulir.
    if (hasil.ok) router.push("/daftar/lengkapi");
    else setGagal(true);
  }

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
      {gagal && <Peringatan>Pendaftaran belum berhasil. Periksa datamu lalu coba lagi.</Peringatan>}

      {!petani && (
        <PilihPeran label="Peran" nilai={jenis} opsi={OPSI_PEMBELI} onUbah={setJenis} />
      )}

      <button
        type="button"
        onClick={() => void masukDenganGoogle()}
        className={kelasTombol("google")}
      >
        <IkonGoogle />
        Daftar dengan Google
      </button>

      <div className="flex items-center gap-3 text-[13px] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        atau daftar dengan email
      </div>

      <Kolom id="nama" label="Nama lengkap" bantuan={galat.nama && <Bantuan id="nama-galat" galat>{galat.nama}</Bantuan>}>
        <KolomTeks
          id="nama"
          placeholder="Contoh: Budi Santoso"
          autoComplete="name"
          galat={!!galat.nama}
          aria-describedby={galat.nama ? "nama-galat" : undefined}
          value={nama}
          onChange={(e) => ubah("nama", setNama)(e.target.value)}
        />
      </Kolom>

      <Kolom id="email" label="Email" bantuan={galat.email && <Bantuan id="email-galat" galat>{galat.email}</Bantuan>}>
        <KolomTeks
          id="email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          galat={!!galat.email}
          aria-describedby={galat.email ? "email-galat" : undefined}
          value={email}
          onChange={(e) => ubah("email", setEmail)(e.target.value)}
        />
      </Kolom>

      {petani && (
        <>
          <Kolom id="nama-toko" label="Nama toko atau kebun" bantuan={galat.namaToko && <Bantuan id="nama-toko-galat" galat>{galat.namaToko}</Bantuan>}>
            <KolomTeks
              id="nama-toko"
              placeholder="Contoh: Kebun Sayur Pak Budi"
              galat={!!galat.namaToko}
              aria-describedby={galat.namaToko ? "nama-toko-galat" : undefined}
              value={namaToko}
              onChange={(e) => ubah("namaToko", setNamaToko)(e.target.value)}
            />
          </Kolom>

          <Kolom id="wilayah" label="Kabupaten / Kota (Jawa Barat)" bantuan={galat.wilayah && <Bantuan id="wilayah-galat" galat>{galat.wilayah}</Bantuan>}>
            <KolomPilihan
              id="wilayah"
              galat={!!galat.wilayah}
              aria-describedby={galat.wilayah ? "wilayah-galat" : undefined}
              value={wilayah}
              onChange={(e) => ubah("wilayah", setWilayah)(e.target.value)}
            >
              <option value="">Pilih kabupaten atau kota</option>
              {WILAYAH_JAWA_BARAT.map((w) => (
                <option key={w.nilai} value={w.nilai}>
                  {w.label}
                </option>
              ))}
            </KolomPilihan>
          </Kolom>

          <Kolom id="kecamatan" label="Kecamatan" bantuan={galat.kecamatan && <Bantuan id="kecamatan-galat" galat>{galat.kecamatan}</Bantuan>}>
            <KolomTeks
              id="kecamatan"
              placeholder="Contoh: Lembang"
              galat={!!galat.kecamatan}
              aria-describedby={galat.kecamatan ? "kecamatan-galat" : undefined}
              value={kecamatan}
              onChange={(e) => ubah("kecamatan", setKecamatan)(e.target.value)}
            />
          </Kolom>
        </>
      )}

      <Kolom
        id="kata-sandi"
        label="Kata sandi"
        bantuan={
          <Bantuan id="kata-sandi-bantuan" galat={!!galat.kataSandi}>
            {galat.kataSandi ?? "Minimal 8 karakter, gabungan huruf dan angka."}
          </Bantuan>
        }
      >
        <KolomKataSandi
          id="kata-sandi"
          placeholder="Buat kata sandi"
          autoComplete="new-password"
          galat={!!galat.kataSandi}
          aria-describedby="kata-sandi-bantuan"
          value={kataSandi}
          onChange={(e) => ubah("kataSandi", setKataSandi)(e.target.value)}
        />
      </Kolom>

      <p className="text-[13px] leading-normal text-muted [&_a]:font-semibold [&_a]:text-brand-900 [&_a]:no-underline [&_a:hover]:underline">
        Dengan mendaftar, kamu menyetujui{" "}
        <Link href="/bantuan/syarat-ketentuan">Syarat &amp; Ketentuan</Link> dan{" "}
        <Link href="/bantuan/kebijakan-privasi">Kebijakan Privasi</Link> Pasok Tani.
      </p>

      <button type="submit" disabled={mengirim} className={kelasTombol("utama")}>
        Buat akun
      </button>

      <p className="text-center text-[15px] text-muted">
        Sudah punya akun?
        <Link href="/masuk" className="ml-1 font-bold text-brand-900 no-underline hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
