export function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 ${size} text-[#C2A032]`} aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? "" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Spinner({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D5C3A] border-t-transparent" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    VERIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    ACHIEVED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    FEATURED: "bg-amber-50 text-amber-700 ring-amber-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    PROCESSING: "bg-blue-50 text-blue-700 ring-blue-100",
    SHIPPED: "bg-sky-50 text-sky-700 ring-sky-100",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-100",
    SUSPENDED: "bg-rose-50 text-rose-700 ring-rose-100",
    REVOKED: "bg-gray-100 text-gray-600 ring-gray-200",
    SOLD_OUT: "bg-gray-100 text-gray-600 ring-gray-200",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-100",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${styles[status] ?? "bg-gray-100 text-gray-600 ring-gray-200"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
