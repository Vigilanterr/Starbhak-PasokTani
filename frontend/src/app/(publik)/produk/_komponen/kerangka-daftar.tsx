import { KerangkaBaris, KerangkaGridProduk } from "../../_komponen/kerangka";

/** Fallback `<Suspense>` untuk `DaftarProduk`; tata letaknya sama agar tidak ada lompatan. */
export function KerangkaDaftarProduk() {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-3 lg:col-start-2 lg:row-start-1 lg:flex lg:justify-between">
        <KerangkaBaris className="h-11 w-28 rounded-[10px] lg:hidden" />
        <KerangkaBaris className="h-11 w-full rounded-[10px] lg:order-2 lg:w-72" />
        <KerangkaBaris className="h-5 w-24 lg:order-1" />
        <KerangkaBaris className="h-11 w-32 justify-self-end rounded-[10px] lg:hidden" />
      </div>
      <div
        aria-hidden
        className="hidden h-130 animate-pulse rounded-2xl border border-line bg-white lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block"
      />
      <div className="min-w-0 lg:col-start-2 lg:row-start-2">
        <KerangkaGridProduk />
      </div>
    </div>
  );
}
