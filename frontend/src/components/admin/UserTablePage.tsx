"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatDate, type PaginationMeta, type User } from "@/lib/api";
import { FilterInput, PageHeader, Panel, Select, TableShell, Td, Th } from "@/components/admin/AdminUI";
import { Spinner, StatusPill } from "@/components/ui/Primitives";

interface FarmerRow extends User {
  productCount?: number;
  achievementCount?: number;
  createdAt?: string;
}

export function UserTablePage({
  role,
  title,
  description,
}: {
  role: "FARMER" | "BUYER";
  title: string;
  description: string;
}) {
  const [rows, setRows] = useState<FarmerRow[]>([]);
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
      const endpoint =
        role === "FARMER"
          ? `/api/v1/farmers?page=${page}&limit=15&search=${encodeURIComponent(search)}`
          : `/api/v1/admin/users?role=BUYER&page=${page}&limit=15&search=${encodeURIComponent(search)}${
              status ? `&status=${status}` : ""
            }`;
      const response = await api.get<FarmerRow[]>(endpoint);
      setRows(response.data);
      setMeta(response.meta ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const updateStatus = async (id: number, nextStatus: string) => {
    setSavingId(id);
    try {
      await api.patch(`/api/v1/admin/users/${id}/status`, { status: nextStatus });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memperbarui status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterInput value={search} onChange={(value) => { setPage(1); setSearch(value); }} placeholder="Cari nama, email, atau desa..." />
        {role === "BUYER" && (
          <Select
            value={status}
            onChange={(value) => { setPage(1); setStatus(value); }}
            options={[
              { value: "", label: "Semua status" },
              { value: "PENDING", label: "Menunggu" },
              { value: "VERIFIED", label: "Terverifikasi" },
              { value: "SUSPENDED", label: "Ditangguhkan" },
              { value: "REJECTED", label: "Ditolak" },
            ]}
          />
        )}
        <span className="ml-auto text-xs font-medium text-gray-500">{meta ? `${meta.total} data` : ""}</span>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <Spinner />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Kontak</Th>
              <Th>Wilayah</Th>
              {role === "FARMER" && <Th>Produk</Th>}
              {role === "FARMER" && <Th>Pencapaian</Th>}
              <Th>Bergabung</Th>
              <Th>Status</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-gray-400">Tidak ada data.</Td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60">
                <Td>
                  <p className="font-semibold text-gray-900">{row.fullName}</p>
                  <p className="text-xs text-gray-400">@{row.username}</p>
                </Td>
                <Td>
                  <p>{row.email}</p>
                  <p className="text-xs text-gray-400">{row.phone}</p>
                </Td>
                <Td>{row.village || "-"}</Td>
                {role === "FARMER" && <Td>{row.productCount ?? 0}</Td>}
                {role === "FARMER" && <Td>{row.achievementCount ?? 0}</Td>}
                <Td className="whitespace-nowrap text-xs">{row.createdAt ? formatDate(row.createdAt) : "-"}</Td>
                <Td><StatusPill status={row.status} /></Td>
                <Td>
                  <div className="flex gap-1.5">
                    {row.status !== "VERIFIED" && (
                      <button
                        disabled={savingId === row.id}
                        onClick={() => updateStatus(row.id, "VERIFIED")}
                        className="rounded-lg bg-[#0D5C3A] px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
                      >
                        Verifikasi
                      </button>
                    )}
                    {row.status !== "SUSPENDED" && (
                      <button
                        disabled={savingId === row.id}
                        onClick={() => updateStatus(row.id, "SUSPENDED")}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-bold text-gray-600 hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
                      >
                        Suspend
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
