"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import type { Satuan } from "@/lib/api/tipe";
import { angka, hargaPerSatuan, LABEL_SATUAN, rupiah } from "@/lib/format";
import { kelasTombolSitus } from "@/app/_komponen/tombol";

type Props = {
  /** Path halaman ini, untuk `/masuk?lanjut=`. */
  path: string;
  /** Perkiraan harga per satuan saat panen. */
  harga: number;
  satuan: Satuan;
  minKomitmen: number;
  /** Sisa kuota dalam satuan; `null` = tanpa kuota. */
  sisaKuota: number | null;
  /** 0 bila pembatalan saat ini tanpa penalti, 20 bila kena penalti 20% dana minimum. */
  penaltiPersen: number;
  catatanPenalti: string;
};

function bilanganBulat(teks: string): number | null {
  const t = teks.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

/** Input rentang Komitmen (min-maks) dengan hitungan dana ditahan dan perkiraan sisa pembayaran. */
export function FormKomitmen({ path, harga, satuan, minKomitmen, sisaKuota, penaltiPersen, catatanPenalti }: Props) {
  const router = useRouter();
  const id = useId();
  const refMin = useRef<HTMLInputElement>(null);
  const refMax = useRef<HTMLInputElement>(null);
  const s = LABEL_SATUAN[satuan];

  const [teksMin, setTeksMin] = useState(String(minKomitmen));
  const [teksMax, setTeksMax] = useState(String(Math.max(minKomitmen, Math.min(minKomitmen * 2, sisaKuota ?? Infinity))));
  const [disentuh, setDisentuh] = useState({ min: false, max: false });
  const [dicoba, setDicoba] = useState(false);

  const min = bilanganBulat(teksMin);
  const max = bilanganBulat(teksMax);

  let galatMin: string | null = null;
  if (min === null) galatMin = teksMin.trim() === "" ? "Isi jumlah minimum." : "Gunakan bilangan bulat.";
  else if (min < minKomitmen) galatMin = `Minimal ${angka(minKomitmen)} ${s}.`;
  else if (sisaKuota !== null && min > sisaKuota) galatMin = `Melebihi sisa kuota (${angka(sisaKuota)} ${s}).`;

  let galatMax: string | null = null;
  if (max === null) galatMax = teksMax.trim() === "" ? "Isi jumlah maksimum." : "Gunakan bilangan bulat.";
  else if (min !== null && max < min) galatMax = "Tidak boleh kurang dari minimum.";
  else if (sisaKuota !== null && max > sisaKuota) galatMax = `Maksimal ${angka(sisaKuota)} ${s} (sisa kuota).`;

  const minSah = galatMin === null ? min : null;
  const maxSah = galatMax === null ? max : null;
  const danaDitahan = minSah !== null ? minSah * harga : null;
  const selisih = minSah !== null && maxSah !== null ? maxSah - minSah : null;
  const penalti = danaDitahan !== null && penaltiPersen > 0 ? Math.round((danaDitahan * penaltiPersen) / 100) : null;

  const idPetunjuk = `${id}-petunjuk`;

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDicoba(true);
    if (galatMin) {
      refMin.current?.focus();
      return;
    }
    if (galatMax) {
      refMax.current?.focus();
      return;
    }
    // TODO: sambungkan ke API Komitmen setelah sesi tersedia (tahan dana minimum di escrow, simpan rentang min-maks).
    router.push(`/masuk?lanjut=${encodeURIComponent(path)}`);
  }

  return (
    // Tanpa JS, form tetap mengarah ke halaman masuk (input jumlah sengaja tanpa `name`).
    <form action="/masuk" method="get" noValidate onSubmit={kirim} className="mt-5">
      <input type="hidden" name="lanjut" value={path} />
      <fieldset>
        <legend className="text-[15px] font-semibold text-ink">Rentang jumlah</legend>
        <p id={idPetunjuk} className="mt-0.5 text-[13px] text-muted">
          Minimal {angka(minKomitmen)} {s}
          {sisaKuota !== null && `, maksimal ${angka(sisaKuota)} ${s} (sisa kuota)`}.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <BidangJumlah
            id={`${id}-min`}
            label="Minimum"
            satuan={s}
            nilai={teksMin}
            ubah={setTeksMin}
            lepas={() => setDisentuh((x) => ({ ...x, min: true }))}
            galat={dicoba || disentuh.min ? galatMin : null}
            refInput={refMin}
            batasBawah={minKomitmen}
            batasAtas={sisaKuota}
            idPetunjuk={idPetunjuk}
          />
          <BidangJumlah
            id={`${id}-max`}
            label="Maksimum"
            satuan={s}
            nilai={teksMax}
            ubah={setTeksMax}
            lepas={() => setDisentuh((x) => ({ ...x, max: true }))}
            galat={dicoba || disentuh.max ? galatMax : null}
            refInput={refMax}
            batasBawah={minSah ?? minKomitmen}
            batasAtas={sisaKuota}
            idPetunjuk={idPetunjuk}
          />
        </div>
      </fieldset>

      <dl className="mt-4 space-y-3 rounded-xl bg-tint p-4">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-sm leading-snug text-ink">
            <span className="font-semibold">Dana minimum ditahan sekarang</span>
            <span className="mt-0.5 block text-xs text-muted">
              {minSah !== null ? `${angka(minSah)} ${s} × ${rupiah(harga)}` : "Isi jumlah minimum yang sesuai"}
            </span>
          </dt>
          <dd className="shrink-0 text-right text-lg font-bold text-brand-900">
            <output htmlFor={`${id}-min`}>{danaDitahan !== null ? rupiah(danaDitahan) : "–"}</output>
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 border-t border-line pt-3">
          <dt className="text-sm leading-snug text-ink">
            <span className="font-semibold">Perkiraan sisa pembayaran setelah panen</span>
            <span className="mt-0.5 block text-xs text-muted">
              {selisih !== null && `${angka(selisih)} ${s} × ${rupiah(harga)}, `}
              dibayar paling lambat 48 jam setelah panen tersedia
            </span>
          </dt>
          <dd className="shrink-0 text-right text-base font-bold text-ink">
            <output htmlFor={`${id}-min ${id}-max`}>{selisih !== null ? rupiah(selisih * harga) : "–"}</output>
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Harga akhir mengikuti harga saat panen. Hitungan di atas memakai perkiraan {hargaPerSatuan(harga, satuan)}.
      </p>

      <button type="submit" className={`${kelasTombolSitus("aksen")} mt-4 w-full`}>
        Komitmen sekarang
      </button>
      <p className="mt-2.5 text-xs leading-relaxed text-muted">
        {penaltiPersen > 0 &&
          `Jika nanti kamu membatalkan, penalti ${penaltiPersen}% dana minimum${penalti !== null ? ` (${rupiah(penalti)})` : ""}. `}
        {catatanPenalti}
      </p>
    </form>
  );
}

function BidangJumlah({
  id,
  label,
  satuan,
  nilai,
  ubah,
  lepas,
  galat,
  refInput,
  batasBawah,
  batasAtas,
  idPetunjuk,
}: {
  id: string;
  label: string;
  satuan: string;
  nilai: string;
  ubah: (v: string) => void;
  lepas: () => void;
  /** Pesan galat yang ditampilkan; `null` = tidak ada / belum perlu ditampilkan. */
  galat: string | null;
  refInput: RefObject<HTMLInputElement | null>;
  batasBawah: number;
  batasAtas: number | null;
  idPetunjuk: string;
}) {
  const idGalat = `${id}-galat`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
        <span className="sr-only"> ({satuan})</span>
      </label>
      <div
        className={`mt-1 flex h-12 items-center rounded-[10px] border bg-white focus-within:ring-3 ${
          galat ? "border-danger focus-within:ring-danger/25" : "border-field-border focus-within:border-brand-600 focus-within:ring-brand-600/25"
        }`}
      >
        <input
          ref={refInput}
          id={id}
          type="number"
          inputMode="numeric"
          min={batasBawah}
          max={batasAtas ?? undefined}
          step={1}
          value={nilai}
          onChange={(e) => ubah(e.target.value)}
          onBlur={lepas}
          aria-invalid={galat ? true : undefined}
          aria-describedby={galat ? `${idGalat} ${idPetunjuk}` : idPetunjuk}
          className="h-full w-full min-w-0 rounded-[10px] bg-transparent pr-1 pl-3.5 text-base font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span aria-hidden className="shrink-0 pr-3.5 text-sm text-muted">
          {satuan}
        </span>
      </div>
      {galat && (
        <p id={idGalat} className="mt-1 text-xs leading-snug font-medium text-danger">
          {galat}
        </p>
      )}
    </div>
  );
}
