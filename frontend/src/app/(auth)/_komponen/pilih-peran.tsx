"use client";

type Opsi<T extends string> = { nilai: T; label: string; petunjuk: string };

export function PilihPeran<T extends string>({
  label,
  nilai,
  opsi,
  onUbah,
}: {
  label: string;
  nilai: T;
  opsi: readonly Opsi<T>[];
  onUbah: (nilai: T) => void;
}) {
  const aktif = opsi.find((o) => o.nilai === nilai);
  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-2 rounded-[10px] bg-tint p-1"
      >
        {opsi.map((o) => (
          <button
            key={o.nilai}
            type="button"
            aria-pressed={o.nilai === nilai}
            onClick={() => onUbah(o.nilai)}
            className="cursor-pointer rounded-lg bg-transparent p-2.5 text-[15px] font-semibold text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 aria-pressed:bg-brand-900 aria-pressed:text-white"
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-[13px] leading-normal text-muted" aria-live="polite">
        {aktif?.petunjuk}
      </p>
    </div>
  );
}
