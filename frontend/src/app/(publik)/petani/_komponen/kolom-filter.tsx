"use client";

import { useEffect, useRef, type ChangeEvent, type ReactNode } from "react";

/**
 * Kolom form tetap uncontrolled (`defaultValue`, jalan tanpa JS), tetapi isinya disamakan dengan URL
 * ketika URL berubah tanpa lewat form ini (tombol Kembali, tautan "Hapus filter"). Saat form sendiri
 * yang dikirim, nilai di DOM sudah sama sehingga fokus dan posisi kursor tidak terganggu.
 */
function useSelarasUrl<T extends HTMLInputElement | HTMLSelectElement>(nilai: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== nilai) el.value = nilai;
  }, [nilai]);
  return ref;
}

export function KolomCari({
  id,
  name,
  nilai,
  placeholder,
  className,
}: {
  id: string;
  name: string;
  nilai: string;
  placeholder: string;
  className: string;
}) {
  const ref = useSelarasUrl<HTMLInputElement>(nilai);
  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type="search"
      defaultValue={nilai}
      placeholder={placeholder}
      autoComplete="off"
      enterKeyHint="search"
      maxLength={80}
      className={className}
    />
  );
}

/** `<select>` yang langsung mengirim form induknya saat pilihan berubah. */
export function PilihanOtomatis({
  id,
  name,
  nilai,
  className,
  children,
}: {
  id: string;
  name: string;
  nilai: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useSelarasUrl<HTMLSelectElement>(nilai);
  return (
    <select
      ref={ref}
      id={id}
      name={name}
      defaultValue={nilai}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit()}
      className={className}
    >
      {children}
    </select>
  );
}
