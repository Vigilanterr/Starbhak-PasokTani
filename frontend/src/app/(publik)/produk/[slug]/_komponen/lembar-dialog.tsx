"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { IkonSilang } from "@/app/_komponen/ikon";

type Props = {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  deskripsi?: string;
  children: ReactNode;
};

/**
 * Dialog modal native (`showModal`): lembar bawah di ponsel, kotak di tengah mulai `md`.
 * Isi hanya dirender saat terbuka, jadi state form di dalamnya kembali bersih setiap kali dibuka.
 * Esc dan klik latar menutup dialog; fokus dikembalikan browser ke tombol pembuka.
 */
export function LembarDialog({ terbuka, onTutup, judul, deskripsi, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idJudul = useId();
  const idDeskripsi = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (terbuka && !dialog.open) dialog.showModal();
    else if (!terbuka && dialog.open) dialog.close();
  }, [terbuka]);

  function klikLatar(e: MouseEvent<HTMLDialogElement>) {
    // Panel isi menutupi seluruh <dialog> (tanpa padding), jadi klik yang mengenai <dialog> itu sendiri
    // berasal dari ::backdrop.
    if (e.target === e.currentTarget) onTutup();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={idJudul}
      aria-describedby={deskripsi ? idDeskripsi : undefined}
      onClose={onTutup}
      onClick={klikLatar}
      className="mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-white text-ink shadow-2xl backdrop:bg-ink/50 md:m-auto md:max-h-[85dvh] md:w-[calc(100%-2rem)] md:max-w-lg md:rounded-3xl"
    >
      {terbuka && (
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div className="sticky top-0 z-10 border-b border-line bg-white px-5 pt-2 pb-4 md:pt-5">
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line md:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id={idJudul} className="text-lg leading-snug font-bold tracking-tight text-brand-900">
                  {judul}
                </h2>
                {deskripsi && (
                  <p id={idDeskripsi} className="mt-1 text-sm text-muted">
                    {deskripsi}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onTutup}
                aria-label="Tutup"
                className="-mt-1 -mr-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink hover:bg-tint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
              >
                <IkonSilang size={20} />
              </button>
            </div>
          </div>
          <div className="px-5 pt-5 pb-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
