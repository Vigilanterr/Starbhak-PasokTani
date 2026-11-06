/** Kerangka (skeleton) untuk fallback <Suspense>. */

export function KerangkaKartuProduk() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="aspect-[4/3] w-full animate-pulse bg-tint" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-tint" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-tint" />
        <div className="mt-3 h-5 w-2/5 animate-pulse rounded bg-tint" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-tint" />
      </div>
    </div>
  );
}

export function KerangkaGridProduk({ jumlah = 8 }: { jumlah?: number }) {
  return (
    <div role="status" aria-label="Memuat produk">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: jumlah }, (_, i) => (
          <li key={i}>
            <KerangkaKartuProduk />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KerangkaBaris({ className = "h-4 w-full" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded bg-tint ${className}`} />;
}
