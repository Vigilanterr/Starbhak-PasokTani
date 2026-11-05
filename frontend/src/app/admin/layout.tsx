"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Primitives";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/petani", label: "Petani", icon: "🌱" },
  { href: "/admin/pembeli", label: "Pembeli", icon: "🛒" },
  { href: "/admin/komoditas", label: "Komoditas", icon: "🌾" },
  { href: "/admin/pesanan", label: "Pesanan", icon: "📦" },
  { href: "/admin/achievements", label: "Pencapaian", icon: "🏆" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/auth/login");
  }, [loading, isAdmin, router]);

  if (loading) return <Spinner label="Memeriksa akses admin..." />;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FAFBF9] px-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Akses admin diperlukan</h1>
          <Link href="/auth/login" className="mt-4 inline-flex rounded-xl bg-[#0D5C3A] px-5 py-3 text-sm font-bold text-white">
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6] lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200/70 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
          <Image src="/images/logo/color-logo-pasoktani.png" alt="PasokTani" width={32} height={32} className="h-8 w-auto" />
          <div>
            <p className="text-sm font-bold leading-none tracking-tight">
              Pasok <span className="text-[#C2A032]">Tani</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-[#0D5C3A] text-white shadow-sm" : "text-gray-600 hover:bg-[#F3F8F5] hover:text-[#0D5C3A]"
                }`}
              >
                <span className="grid h-6 w-6 place-items-center text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <div className="rounded-xl bg-[#F3F8F5] p-3">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.fullName}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
            <button
              onClick={() => {
                logout();
                router.replace("/auth/login");
              }}
              className="mt-3 w-full rounded-lg border border-[#0D5C3A]/20 px-3 py-1.5 text-xs font-bold text-[#0D5C3A] hover:bg-white"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200/70 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/images/logo/color-logo-pasoktani.png" alt="PasokTani" width={28} height={28} className="h-7 w-auto" />
            <span className="text-sm font-bold">Admin Panel</span>
          </div>
          <p className="hidden text-sm text-gray-500 lg:block">Kelola operasional marketplace PasokTani.</p>
          <div className="flex items-center gap-3">
            <Link href="/pasok-tani" className="text-xs font-semibold text-gray-500 hover:text-[#0D5C3A]">
              Lihat situs
            </Link>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0D5C3A] text-xs font-bold text-white">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-3 py-2 lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                pathname === item.href ? "bg-[#0D5C3A] text-white" : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
