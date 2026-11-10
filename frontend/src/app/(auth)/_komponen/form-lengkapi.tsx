"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ambilProfil,
  lengkapiProfil,
  type InputLengkapi,
  type PeranDaftar,
} from "@/lib/auth-api";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";
import { bacaParam, pathAman } from "@/lib/url";
import { Bantuan, Kolom, KolomPilihan, KolomTeks } from "./kolom";
import { Judul } from "./judul";
import { Peringatan } from "./peringatan";
import { PilihPeran } from "./pilih-peran";
import { kelasTombol } from "./tombol";

type Kunci = "nama" | "telepon" | "namaToko" | "wilayah" | "kecamatan";
type Galat = Partial<Record<Kunci, string>>;

const OPSI_PERAN = [
  { nilai: "konsumen", label: "Saya Konsumen", petunjuk: "Belanja hasil panen segar langsung dari petani." },
  { nilai: "umkm", label: "Saya UMKM", petunjuk: "Beli pasokan langsung dari petani untuk usahamu." },
  { nilai: "petani", label: "Saya Petani", petunjuk: "Jual hasil panen langsung ke UMKM dan pasar." },
] as const;

const TELEPON = /^\+?[0-9]{8,15}$/;

/**
 * Gerbang profil. Hanya untuk orang yang sudah masuk tetapi belum punya profil (misalnya daftar lewat Google).
 * Akun yang sudah punya profil langsung diteruskan. Tanpa sesi, dikirim ke halaman masuk.
 */
export function FormLengkapi() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [peran, setPeran] = useState<PeranDaftar>("konsumen");
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [namaToko, setNamaToko] = useState("");
  const [wilayah, setWilayah] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [galat, setGalat] = useState<Galat>({});
  const [gagal, setGagal] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);

  const petani = peran === "petani";

  useEffect(() => {
    let batal = false;
    ambilProfil().then((hasil) => {
      if (batal) return;
      if (hasil.ok) return router.replace(pathAman(bacaParam("lanjut")) ?? "/");
      if (hasil.kode === "onboarding_required") return setSiap(true);
      if (hasil.kode === "unauthorized") return router.replace(`/masuk?lanjut=${encodeURIComponent("/daftar/lengkapi")}`);
      setGagal("Profil belum bisa dimuat. Muat ulang halaman ini.");
      setSiap(true);
    });
    return () => {
      batal = true;
    };
  }, [router]);

  /** Setter yang sekaligus menghapus galat kolom tersebut saat pengguna mengetik. */
  const ubah = (kunci: Kunci, set: (v: string) => void) => (v: string) => {
    set(v);
    setGalat((g) => ({ ...g, [kunci]: undefined }));
  };

  function periksa(): Galat {
    const g: Galat = {};
    if (nama.trim().length < 2) g.nama = "Nama lengkap wajib diisi.";
    if (telepon.trim() && !TELEPON.test(telepon.trim().replace(/[\s-]/g, ""))) {
      g.telepon = "Nomor telepon tidak valid, contoh: 081234567890.";
    }
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
    setGagal(null);
    const input: InputLengkapi = {
      peran,
      nama: nama.trim(),
      ...(telepon.trim() ? { telepon: telepon.trim().replace(/[\s-]/g, "") } : {}),
      ...(petani ? { namaToko: namaToko.trim(), wilayah, kecamatan: kecamatan.trim() } : {}),
    };
    const hasil = await lengkapiProfil(input);
    setMengirim(false);

    if (hasil.ok) return router.replace(pathAman(bacaParam("lanjut")) ?? "/");
    if (hasil.kode === "unauthorized") return router.replace(`/masuk?lanjut=${encodeURIComponent("/daftar/lengkapi")}`);
    if (hasil.kode === "validation_failed" && hasil.fields) {
      const baru: Galat = {};
      for (const kunci of ["nama", "telepon", "namaToko", "wilayah", "kecamatan"] as const) {
        if (hasil.fields[kunci]) baru[kunci] = hasil.fields[kunci];
      }
      setGalat(baru);
      return;
    }
    setGagal("Profil belum tersimpan. Periksa datamu lalu coba lagi.");
  }

  if (!siap) {
    return (
      <>
        <Judul judul="Memuat profil">Sebentar, kami memeriksa akunmu.</Judul>
      </>
    );
  }

  return (
    <>
      <Judul judul="Lengkapi profil">Pilih peranmu. Data ini dipakai untuk pesanan dan toko.</Judul>

      <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
        {gagal && <Peringatan>{gagal}</Peringatan>}

        <PilihPeran label="Peran" nilai={peran} opsi={OPSI_PERAN} onUbah={setPeran} />

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

        <Kolom id="telepon" label="Nomor telepon (opsional)" bantuan={galat.telepon && <Bantuan id="telepon-galat" galat>{galat.telepon}</Bantuan>}>
          <KolomTeks
            id="telepon"
            type="tel"
            placeholder="081234567890"
            autoComplete="tel"
            galat={!!galat.telepon}
            aria-describedby={galat.telepon ? "telepon-galat" : undefined}
            value={telepon}
            onChange={(e) => ubah("telepon", setTelepon)(e.target.value)}
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

        <button type="submit" disabled={mengirim} className={kelasTombol("utama")}>
          Simpan profil
        </button>
      </form>
    </>
  );
}
