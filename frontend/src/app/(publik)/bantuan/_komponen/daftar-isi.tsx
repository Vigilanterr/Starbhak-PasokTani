"use client";

import { useEffect, useState } from "react";

type Item = { id: string; judul: string };

/** Daftar isi dokumen; bagian yang sedang dibaca ditandai saat halaman digulir. */
export function DaftarIsi({ item }: { item: Item[] }) {
  const [aktif, setAktif] = useState(item[0]?.id ?? "");

  useEffect(() => {
    const bagian = item
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (bagian.length === 0) return;

    const pengamat = new IntersectionObserver(
      (entri) => {
        const terlihat = entri.filter((e) => e.isIntersecting);
        const pertama = terlihat.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (pertama) setAktif(pertama.target.id);
      },
      { rootMargin: "0px 0px -65% 0px" },
    );
    bagian.forEach((el) => pengamat.observe(el));
    return () => pengamat.disconnect();
  }, [item]);

  return (
    <nav aria-label="Daftar isi" className="md:sticky md:top-8">
      <p className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">Daftar isi</p>
      <ol className="flex flex-col gap-3.5">
        {item.map((i, n) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={aktif === i.id ? "location" : undefined}
              className={`text-[15px] no-underline hover:text-brand-900 ${
                aktif === i.id ? "font-semibold text-brand-900" : "text-muted"
              }`}
            >
              {n + 1}. {i.judul}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
