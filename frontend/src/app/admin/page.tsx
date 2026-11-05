"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatNumber, formatRupiah } from "@/lib/api";
import { PageHeader, Panel } from "@/components/admin/AdminUI";
import { Spinner } from "@/components/ui/Primitives";

interface Overview {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  pendingProducts: number;
  pendingUsers: number;
  totalReviews: number;
  totalRevenue: number;
  featuredAchievements: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Overview>("/api/v1/admin/overview")
      .then((response) => setData(response.data))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Gagal memuat dashboard"));
  }, []);

  if (error) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  if (!data) return <Spinner label="Memuat ringkasan operasional..." />;

  const cards = [
    { label: "Total pengguna", value: formatNumber(data.totalUsers), hint: `${data.totalFarmers} petani · ${data.totalBuyers} pembeli`, tone: "bg-[#F3F8F5] text-[#0D5C3A]" },
    { label: "Komoditas", value: formatNumber(data.totalProducts), hint: `${data.pendingProducts} menunggu verifikasi`, tone: "bg-amber-50 text-amber-700" },
    { label: "Pesanan", value: formatNumber(data.totalOrders), hint: `${data.totalReviews} ulasan masuk`, tone: "bg-blue-50 text-blue-700" },
    { label: "Pendapatan selesai", value: formatRupiah(data.totalRevenue), hint: "Akumulasi pesanan COMPLETED", tone: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Ringkasan kesehatan marketplace dan antrean moderasi." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Panel key={card.label} className="p-5">
            <span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${card.tone}`}>
              {card.label}
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-6">
          <h2 className="text-base font-bold text-gray-900">Antrean tindakan</h2>
          <p className="mt-1 text-sm text-gray-500">Item yang perlu ditinjau agar marketplace tetap sehat.</p>
          <div className="mt-5 divide-y divide-gray-100">
            <QueueRow
              title="Verifikasi petani"
              description="Akun petani menunggu persetujuan admin"
              count={data.pendingUsers}
              href="/admin/petani"
            />
            <QueueRow
              title="Verifikasi komoditas"
              description="Produk baru menunggu peninjauan"
              count={data.pendingProducts}
              href="/admin/komoditas"
            />
            <QueueRow
              title="Pencapaian unggulan"
              description="Pencapaian aktif ditandai unggulan"
              count={data.featuredAchievements}
              href="/admin/achievements"
            />
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-base font-bold text-gray-900">Akses cepat</h2>
          <div className="mt-4 grid gap-2">
            {[
              { href: "/admin/achievements", label: "Kelola pencapaian petani" },
              { href: "/admin/komoditas", label: "Moderasi komoditas" },
              { href: "/admin/pesanan", label: "Pantau pesanan" },
              { href: "/admin/pembeli", label: "Daftar pembeli" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#0D5C3A]/30 hover:bg-[#F3F8F5] hover:text-[#0D5C3A]"
              >
                {item.label}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function QueueRow({ title, description, count, href }: { title: string; description: string; count: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 py-4 transition hover:opacity-80">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <span className="grid h-9 min-w-9 place-items-center rounded-full bg-[#F3F8F5] px-2 text-sm font-bold text-[#0D5C3A]">
        {count}
      </span>
    </Link>
  );
}
