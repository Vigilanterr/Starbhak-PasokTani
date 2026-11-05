"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatDate, formatNumber, formatRupiah, type PaginationMeta } from "@/lib/api";
import { FilterInput, PageHeader, Select, TableShell, Td, Th } from "@/components/admin/AdminUI";
import { Spinner, StatusPill } from "@/components/ui/Primitives";

interface OrderRow {
  id: number;
  order_code: string;
  buyer_name: string;
  farmer_name: string;
  commodity_name: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  status: string;
  created_at: string;
}

const statuses = ["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<OrderRow[]>(
        `/api/v1/admin/orders?page=${page}&limit=15&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`
      );
      setRows(response.data);
      setMeta(response.meta ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div>
      <PageHeader title="Monitoring Pesanan" description="Pantau transaksi lintas petani dan pembeli secara read-only." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterInput value={search} onChange={(value) => { setPage(1); setSearch(value); }} placeholder="Cari kode pesanan atau pembeli..." />
        <Select
          value={status}
          onChange={(value) => { setPage(1); setStatus(value); }}
          options={[{ value: "", label: "Semua status" }, ...statuses.slice(1).map((item) => ({ value: item, label: item }))]}
        />
        <span className="ml-auto text-xs font-medium text-gray-500">{meta ? `${meta.total} pesanan` : ""}</span>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <Spinner />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Kode</Th>
              <Th>Komoditas</Th>
              <Th>Pembeli</Th>
              <Th>Petani</Th>
              <Th>Nilai</Th>
              <Th>Tanggal</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><Td className="py-10 text-center text-gray-400">Tidak ada pesanan.</Td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60">
                <Td className="font-mono text-xs font-semibold text-gray-800">{row.order_code}</Td>
                <Td>
                  <p className="font-semibold text-gray-900">{row.commodity_name}</p>
                  <p className="text-xs text-gray-400">{formatNumber(row.quantity)} unit × {formatRupiah(row.unit_price)}</p>
                </Td>
                <Td>{row.buyer_name}</Td>
                <Td>{row.farmer_name}</Td>
                <Td className="whitespace-nowrap font-semibold text-gray-800">{formatRupiah(row.total_price)}</Td>
                <Td className="whitespace-nowrap text-xs">{formatDate(row.created_at)}</Td>
                <Td><StatusPill status={row.status} /></Td>
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
