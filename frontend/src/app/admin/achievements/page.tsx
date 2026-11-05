"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Achievement } from "@/lib/api";
import { PageHeader, Panel, TableShell, Td, Th } from "@/components/admin/AdminUI";
import { Spinner, StatusPill } from "@/components/ui/Primitives";

type FormMode = "create" | "edit";

interface AchievementFormState {
  open: boolean;
  mode: FormMode;
  editingId: number | null;
  farmerId: number;
  title: string;
  description: string;
  badgeIcon: string;
  attainedAt: string;
  status: string;
}

const initialForm: AchievementFormState = {
  open: false,
  mode: "create",
  editingId: null,
  farmerId: 0,
  title: "",
  description: "",
  badgeIcon: "",
  attainedAt: new Date().toISOString().slice(0, 10),
  status: "ACHIEVED",
};

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [farmers, setFarmers] = useState<{ id: number; fullName: string }[]>([]);
  const [form, setForm] = useState<AchievementFormState>(initialForm);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const buildQuery = () => {
    const params = new URLSearchParams({ search });
    if (statusFilter) params.set("status", statusFilter);
    return `?${params.toString()}`;
  };

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Achievement[]>(`/api/v1/achievements${buildQuery()}`);
      setAchievements(response.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat pencapaian");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, search, statusFilter]);

  const loadFarmers = useCallback(async () => {
    try {
      const response = await api.get<{ id: number; fullName: string }[]>(
        "/api/v1/farmers?limit=100"
      );
      setFarmers(response.data);
    } catch {
      setFarmers([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAchievements();
      loadFarmers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadAchievements, loadFarmers]);

  const openForm = (mode: FormMode, achievement?: Achievement) => {
    setForm({
      ...initialForm,
      open: true,
      mode,
      editingId: achievement?.id ?? null,
      farmerId: achievement?.farmerId ?? 0,
      title: achievement?.title ?? "",
      description: achievement?.description ?? "",
      badgeIcon: achievement?.badgeIcon ?? "",
      attainedAt: achievement?.attainedAt ? achievement.attainedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: achievement?.status ?? "ACHIEVED",
    });
  };

  const closeForm = () => setForm({ ...initialForm, open: false });

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        farmerId: form.farmerId || undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        badgeIcon: form.badgeIcon.trim() || undefined,
        attainedAt: form.attainedAt ? new Date(form.attainedAt) : undefined,
        status: form.status as "ACHIEVED" | "FEATURED" | "REVOKED",
      };

      if (form.mode === "create") {
        await api.post(`/api/v1/achievements`, payload);
      } else if (form.editingId !== null) {
        await api.patch(`/api/v1/achievements/${form.editingId}`, payload);
      }

      closeForm();
      await loadAchievements();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyimpan pencapaian");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus pencapaian ini?")) return;
    try {
      await api.delete(`/api/v1/achievements/${id}`);
      setAchievements((prev) => prev.filter((item) => item.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menghapus pencapaian");
    }
  };

  if (loading) return <Spinner label="Memuat pencapaian..." />;

  return (
    <div>
      <PageHeader title="Kelola Pencapaian Petani" description="Admin memberikan, mengedit, dan menghapus pencapaian yang diberikan kepada petani." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          id="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari pencapaian atau nama petani..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10 sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0D5C3A]"
        >
          <option value="">Semua status</option>
          <option value="ACHIEVED">Terverifikasi</option>
          <option value="FEATURED">Unggulan</option>
          <option value="REVOKED">Dibatalkan</option>
        </select>
        <button
          onClick={() => openForm("create")}
          className="rounded-xl bg-[#0D5C3A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0A472C] transition"
        >
          + Tambah Pencapaian
        </button>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {achievements.length === 0 && (
        <Panel className="p-6 mb-5">
          <EmptyState title="Belum ada pencapaian" description="Pencapaian petani yang diberikan admin akan muncul di sini." />
        </Panel>
      )}

      <TableShell className="mb-5">
        <thead>
          <tr>
            <Th>Petani</Th>
            <Th>Pencapaian</Th>
            <Th>Deskripsi</Th>
            <th className="border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Badge
            </th>
            <Th>Diberikan</Th>
            <Th>Status</Th>
            <Th>Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {achievements.map((achievement) => (
            <tr key={achievement.id} className="hover:bg-gray-50/60">
              <Td>
                <p className="font-semibold text-gray-900">{achievement.farmerName || "-"}</p>
                <p className="text-xs text-gray-400">ID {achievement.farmerId}</p>
              </Td>
              <Td className="text-sm font-semibold text-gray-800">{achievement.title}</Td>
              <Td className="max-w-60 text-xs text-gray-600 leading-5 line-clamp-2">{achievement.description}</Td>
              <Td>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xl font-bold text-gray-600">
                  {achievement.badgeIcon || "🏅"}
                </div>
              </Td>
              <Td className="whitespace-nowrap text-xs text-gray-500">
                {achievement.attainedAt ? achievement.attainedAt.slice(0, 10) : "-"}
              </Td>
              <Td><StatusPill status={achievement.status} /></Td>
              <Td>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openForm("edit", achievement)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(achievement.id)}
                    className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    Hapus
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      <Panel className="p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
          {form.mode === "create" ? "Berikan Pencapaian Baru" : "Edit Pencapaian"}
        </h3>
        <form onSubmit={submitForm} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">Petani</label>
              <select
                value={form.farmerId || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, farmerId: parseInt(event.target.value, 10) || 0 }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0D5C3A]"
              >
                <option value="" disabled>
                  Pilih petani
                </option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">Status</label>
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0D5C3A]"
              >
                <option value="ACHIEVED">Terverifikasi</option>
                <option value="FEATURED">Unggulan</option>
                <option value="REVOKED">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Judul pencapaian</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Misal: Petani Teladan Kecamatan"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Deskripsi</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Deskripsi singkat mengenai pencapaian ini..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">Badge ikon</label>
              <input
                type="text"
                value={form.badgeIcon}
                onChange={(event) => setForm((prev) => ({ ...prev, badgeIcon: event.target.value }))}
                placeholder="🏆 / 🌱 / 🤝"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">Tanggal diperoleh</label>
              <input
                type="date"
                value={form.attainedAt}
                onChange={(event) => setForm((prev) => ({ ...prev, attainedAt: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10"
                required
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={closeForm} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Batal
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || !form.description.trim() || !form.farmerId}
              className="rounded-xl bg-[#0D5C3A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0A472C] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {form.mode === "create" ? "Simpan Pencapaian" : "Perbarui Pencapaian"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
