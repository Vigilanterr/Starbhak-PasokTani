import { KerangkaBaris } from "@/app/(publik)/_komponen/kerangka";

function KerangkaKartuPetani() {
  return (
    <div aria-hidden className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start gap-3.5">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-tint" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <KerangkaBaris className="h-4 w-3/5" />
          <KerangkaBaris className="h-3 w-4/5" />
          <KerangkaBaris className="h-3 w-2/5" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <KerangkaBaris className="h-6 w-28 rounded-full" />
        <KerangkaBaris className="h-6 w-24 rounded-full" />
      </div>
      <KerangkaBaris className="h-3 w-4/5" />
    </div>
  );
}

/** Fallback `<Suspense>` direktori petani: form filter + grid kartu. */
export function KerangkaDirektori() {
  return (
    <div role="status" aria-label="Memuat daftar petani">
      <div aria-hidden className="h-[278px] animate-pulse rounded-2xl border border-line bg-white sm:h-[192px] lg:h-[114px]" />
      <div className="mt-8 mb-4 md:mt-10 md:mb-5">
        <KerangkaBaris className="h-7 w-40" />
        <KerangkaBaris className="mt-2 h-4 w-28" />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <KerangkaKartuPetani />
          </li>
        ))}
      </ul>
    </div>
  );
}
