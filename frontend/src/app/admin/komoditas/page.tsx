"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatDate, formatNumber, formatRupiah, type PaginationMeta, type Product } from "@/lib/api";
import { FilterInput, PageHeader, Select, TableShell, Td, Th } from "@/components/admin/AdminUI";
import { Spinner, StatusPill } from "@/components/ui/Primitives";

export default function AdminCommoditiesPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Product[]>(
        `/api/v1/admin/commodities?page=${page}&limit=15&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`
      );
      setRows(response.data);
      setMeta(response.meta ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat komoditas");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const moderate = async (id: number, nextStatus: string) => {
    setSavingId(id);
    try {
      await api.patch(`/api/v1/admin/commodities/${id}/status`, { status: nextStatus });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memperbarui status komoditas");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Moderasi Komoditas" description="Tinjau produk baru, verifikasi, atau tolak yang tidak sesuai standar." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterInput value={search} onChange={(value) => { setPage(1); setSearch(value); }} placeholder="Cari komoditas atau petani..." />
        <Select
          value={status}
          onChange={(value) => { setPage(1); setStatus(value); }}
          options={[
            { value: "", label: "Semua status" },
            { value: "PENDING", label: "Menunggu" },
            { value: "VERIFIED", label: "Terverifikasi" },
            { value: "AVAILABLE", label: "Tersedia" },
            { value: "SOLD_OUT", label: "Habis" },
            { value: "REJECTED", label: "Ditolak" },
          ]}
        />
        <span className="ml-auto text-xs font-medium text-gray-500">{meta ? `${meta.total} komoditas` : ""}</span>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <Spinner />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Komoditas</Th>
              <Th>Petani</Th>
              <Th>Harga</Th>
              <Th>Stok</Th>
              <Th>Diajukan</Th>
              <Th>Status</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><Td className="py-10 text-center text-gray-400">Tidak ada komoditas.</Td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60">
                <Td>
                  <p className="font-semibold text-gray-900">{row.name}</p>
                  <p className="text-xs text-gray-400">{row.category_name} · {row.location}</p>
                </Td>
                <Td>{row.farmer_name || "-"}</Td>
                <Td className="whitespace-nowrap font-semibold text-gray-800">{formatRupiah(row.price)}<span className="text-xs font-normal text-gray-400"> /{row.unit}</span></Td>
                <Td className="whitespace-nowrap">{formatNumber(row.stock)} {row.unit}</Td>
                <Td className="whitespace-nowrap text-xs">{formatDate(row.created_at)}</Td>
                <Td><StatusPill status={row.status} /></Td>
                <Td>
                  <div className="flex gap-1.5">
                    {row.status !== "VERIFIED" && row.status !== "AVAILABLE" && (
                      <button
                        disabled={savingId === row.id}
                        onClick={() => moderate(row.id, "VERIFIED")}
                        className="rounded-lg bg-[#0D5C3A] px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
                      >
                        Verifikasi
                      </button>
                    )}
                    {row.status !== "REJECTED" && (
                      <button
                        disabled={savingId === row.id}
                        onClick={() => moderate(row.id, "REJECTED")}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-bold text-gray-600 hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      {meta && meta.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">Halaman {meta.page} dari {meta.pages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Sebelumnya</button>
            <button disabled={page >= meta.pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Berikutnya</button>
          </div>
        </div>
      )}
    </div>
  );
}
