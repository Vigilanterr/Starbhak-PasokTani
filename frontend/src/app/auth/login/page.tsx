"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") router.replace("/admin");
      else if (user.role === "FARMER") router.replace(`/petani/${user.id}`);
      else router.replace("/pasok-tani");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#0A472C] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#10B981]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#C2A032]/20 blur-3xl" />
        <Link href="/pasok-tani" className="relative flex items-center gap-3">
          <Image src="/images/logo/color-logo-pasoktani.png" alt="PasokTani" width={44} height={44} className="h-11 w-auto" />
          <span className="text-xl font-bold tracking-tight">
            Pasok <span className="text-[#C2A032]">Tani</span>
          </span>
        </Link>
        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">Marketplace hasil tani</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Panen lebih bernilai, tanpa rantai yang panjang.
          </h1>
          <p className="mt-4 text-emerald-50/80">
            Kelola komoditas, pantau pesanan, dan bangun reputasi usaha tani Anda dalam satu platform terverifikasi.
          </p>
        </div>
        <p className="relative text-sm text-emerald-100/60">© {new Date().getFullYear()} PasokTani</p>
      </section>

      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <Link href="/pasok-tani" className="mb-10 flex items-center gap-2 lg:hidden">
            <Image src="/images/logo/color-logo-pasoktani.png" alt="PasokTani" width={36} height={36} className="h-9 w-auto" />
            <span className="text-lg font-bold">
              Pasok <span className="text-[#C2A032]">Tani</span>
            </span>
          </Link>
          <p className="text-sm font-semibold text-[#0D5C3A]">Selamat datang kembali</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Masuk ke akun Anda</h2>
          <p className="mt-2 text-sm text-gray-500">Gunakan email dan kata sandi yang terdaftar.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-700">Kata sandi</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D5C3A] focus:ring-4 focus:ring-[#0D5C3A]/10"
              />
            </label>

            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0D5C3A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0A472C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link href="/pasok-tani" className="font-semibold text-[#0D5C3A] hover:underline">
              Daftar sebagai petani
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
