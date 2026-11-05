"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  formatDate,
  formatNumber,
  formatRupiah,
  type Achievement,
  type FarmerProfile,
  type Product,
  type Review,
} from "@/lib/api";
import { EmptyState, Stars, StatusPill, Spinner } from "@/components/ui/Primitives";

type Tab = "produk" | "tentang" | "ulasan" | "pencapaian";

const tabs: { id: Tab; label: string }[] = [
  { id: "produk", label: "Produk" },
  { id: "tentang", label: "Tentang" },
  { id: "ulasan", label: "Ulasan" },
  { id: "pencapaian", label: "Pencapaian" },
];

export default function FarmerProfilePage() {
  const params = useParams<{ id: string }>();
  const farmerId = params.id;
  const { user } = useAuth();

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tab, setTab] = useState<Tab>("produk");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileResponse, productResponse, reviewResponse, achievementResponse] = await Promise.all([
        api.get<FarmerProfile>(`/api/v1/farmers/${farmerId}`),
        api.get<Product[]>(`/api/v1/farmers/${farmerId}/products?limit=12`),
        api.get<Review[]>(`/api/v1/farmers/${farmerId}/reviews?limit=10`),
        api.get<Achievement[]>(`/api/v1/farmers/${farmerId}/achievements`),
      ]);
      setProfile(profileResponse.data);
      setProducts(productResponse.data);
      setReviews(reviewResponse.data);
      setAchievements(achievementResponse.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat profil petani");
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    load();
  }, [load]);

  const featured = useMemo(() => achievements.find((item) => item.status === "FEATURED"), [achievements]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFBF9]">
        <ProfileNavbar />
        <Spinner label="Memuat profil petani..." />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#FAFBF9]">
        <ProfileNavbar />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profil tidak ditemukan</h1>
          <p className="mt-2 text-sm text-gray-500">{error || "Petani ini belum tersedia di PasokTani."}</p>
          <Link href="/pasok-tani" className="mt-6 inline-flex rounded-xl bg-[#0D5C3A] px-5 py-3 text-sm font-bold text-white">
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFBF9] pb-20">
      <ProfileNavbar />

      <section className="relative">
        <div className="h-44 overflow-hidden bg-[#0A472C] sm:h-56">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,#10B981_0,transparent_45%),radial-gradient(circle_at_85%_10%,#C2A032_0,transparent_40%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] [background-size:36px_36px]" />
        </div>

        <div className="mx-auto -mt-20 max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(13,92,58,0.35)] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative -mt-16 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-[#F3F8F5] shadow-lg sm:-mt-20 sm:h-32 sm:w-32">
                {profile.fotoProfile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.fotoProfile} alt={profile.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D5C3A] to-[#10B981] text-4xl font-bold text-white">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{profile.fullName}</h1>
                  {profile.status === "VERIFIED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-[9px] text-white">✓</span>
                      Terverifikasi
                    </span>
                  )}
                  {featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
                      ★ Petani Unggulan
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#0D5C3A]">●</span>
                    {profile.village || profile.address || "Lokasi belum diisi"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Stars rating={profile.rating} />
                    <strong className="font-semibold text-gray-900">{profile.rating.toFixed(1)}</strong>
                    <span className="text-gray-400">({formatNumber(profile.reviewCount)} ulasan)</span>
                  </span>
                  {profile.farmingExperience && <span>Pengalaman {profile.farmingExperience}</span>}
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                  {profile.bio || "Petani mitra PasokTani yang berkomitmen menyediakan hasil panen segar dan berkualitas."}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#0D5C3A] hover:text-[#0D5C3A]">
                  Hubungi
                </button>
                <button className="rounded-xl bg-[#0D5C3A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A472C]">
                  Ikuti
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-4">
              <Stat label="Produk aktif" value={formatNumber(profile.productCount)} />
              <Stat label="Pesanan selesai" value={formatNumber(profile.completedOrders)} />
              <Stat label="Total terjual" value={`${formatNumber(profile.totalSold)} kg`} />
              <Stat label="Pencapaian" value={formatNumber(profile.achievementCount)} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="sticky top-0 z-20 -mx-4 border-b border-gray-100 bg-[#FAFBF9]/95 px-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-2">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative whitespace-nowrap px-4 py-4 text-sm font-semibold transition ${
                  tab === item.id ? "text-[#0D5C3A]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {item.label}
                {item.id === "pencapaian" && achievements.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#0D5C3A]/10 px-1.5 py-0.5 text-[10px] text-[#0D5C3A]">
                    {achievements.length}
                  </span>
                )}
                {tab === item.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#0D5C3A]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {tab === "produk" && (
            <section>
              <SectionHeading title="Produk dari petani" subtitle={`${products.length} komoditas siap dipesan`} />
              {products.length === 0 ? (
                <EmptyState title="Belum ada produk" description="Petani ini belum menerbitkan komoditas yang tersedia." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "tentang" && (
            <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <SectionHeading title="Tentang usaha tani" subtitle="Profil dan praktik budidaya" />
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                  {profile.bio || "Petani mitra PasokTani yang berkomitmen menyediakan hasil panen segar dan berkualitas."}
                </p>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Detail label="Desa / wilayah" value={profile.village} />
                  <Detail label="Alamat" value={profile.address} />
                  <Detail label="Pengalaman bertani" value={profile.farmingExperience} />
                  <Detail label="Luas lahan" value={profile.farmArea} />
                  <Detail label="Metode budidaya" value={profile.farmingMethod} />
                  <Detail label="Bergabung sejak" value={profile.createdAt ? formatDate(profile.createdAt) : null} />
                </dl>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#0D5C3A]/10 bg-[#F3F8F5] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0D5C3A]">Komitmen kualitas</p>
                  <p className="mt-3 text-sm leading-6 text-[#0A472C]">
                    Setiap komoditas melalui proses verifikasi sebelum tayang. Kualitas, asal panen, dan ketersediaan stok
                    diperbarui langsung oleh petani.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6">
                  <p className="text-sm font-bold text-gray-900">Kontak</p>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p>Telepon: {profile.phone || "-"}</p>
                    <p>Email: {profile.email || "-"}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === "ulasan" && (
            <section className="grid gap-5 lg:grid-cols-[1fr_1.8fr]">
              <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6">
                <p className="text-sm font-bold text-gray-900">Penilaian pembeli</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">{profile.rating.toFixed(1)}</span>
                  <div className="pb-1">
                    <Stars rating={profile.rating} size="text-base" />
                    <p className="mt-1 text-xs text-gray-500">{formatNumber(profile.reviewCount)} ulasan</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((review) => review.rating === star).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3">{star}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-[#C2A032]" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <EmptyState title="Belum ada ulasan" description="Ulasan akan muncul setelah pembeli menyelesaikan pesanan." />
                ) : (
                  reviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#F3F8F5] text-sm font-bold text-[#0D5C3A]">
                          {review.buyer_foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={review.buyer_foto} alt={review.buyer_name} className="h-full w-full object-cover" />
                          ) : (
                            review.buyer_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.buyer_name}</p>
                          <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                        </div>
                        <div className="ml-auto">
                          <Stars rating={review.rating} />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment || "Pembeli tidak menuliskan komentar."}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}

          {tab === "pencapaian" && (
            <section>
              <SectionHeading
                title="Pencapaian petani"
                subtitle={`${achievements.length} pencapaian tercatat dan diverifikasi admin`}
              />
              {achievements.length === 0 ? (
                <EmptyState title="Belum ada pencapaian" description="Pencapaian yang diberikan admin akan tampil di sini." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {achievements.map((achievement) => (
                    <article
                      key={achievement.id}
                      className={`relative overflow-hidden rounded-2xl border p-5 ${
                        achievement.status === "FEATURED"
                          ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      {achievement.status === "FEATURED" && (
                        <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          UNGGULAN
                        </span>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#F3F8F5] text-2xl ring-1 ring-[#0D5C3A]/10">
                          {achievement.badgeIcon || "🏅"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="pr-16 text-base font-bold leading-snug text-gray-900">{achievement.title}</h3>
                          <p className="mt-1 text-xs text-gray-400">Diperoleh {formatDate(achievement.attainedAt)}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-gray-600">{achievement.description}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <StatusPill status={achievement.status} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {user?.role === "FARMER" && user.id === profile.id && (
                <p className="mt-5 rounded-xl bg-[#F3F8F5] px-4 py-3 text-xs text-[#0A472C]">
                  Pencapaian dikelola sepenuhnya oleh admin. Hubungi admin jika ada data yang perlu diperbarui.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function ProfileNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/pasok-tani" className="flex items-center gap-2.5">
          <Image src="/images/logo/color-logo-pasoktani.png" alt="PasokTani" width={34} height={34} className="h-8 w-auto" />
          <span className="text-lg font-bold tracking-tight">
            Pasok <span className="text-[#C2A032]">Tani</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-600 sm:flex">
          <Link href="/pasok-tani" className="hover:text-[#0D5C3A]">Beranda</Link>
          <span className="text-[#0D5C3A]">Profil Petani</span>
        </nav>
        <Link href="/auth/login" className="rounded-full bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#0D9F6E]">
          Masuk
        </Link>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-700">{value || "-"}</dd>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(13,92,58,0.4)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#F3F8F5] to-[#E7F1EA]">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-bold text-[#0D5C3A]/20">
            {product.name.charAt(0)}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#0D5C3A] backdrop-blur">
          {product.category_name}
        </span>
        <span className="absolute right-3 top-3">
          <StatusPill status={product.status} />
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">{product.name}</h3>
        <p className="mt-1 text-xs text-gray-500">{product.location}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold text-[#0D5C3A]">{formatRupiah(product.price)}</p>
            <p className="text-[11px] text-gray-400">per {product.unit}</p>
          </div>
          <div className="text-right">
            <Stars rating={Number(product.rating)} size="text-xs" />
            <p className="mt-0.5 text-[11px] text-gray-400">Stok {formatNumber(product.stock)} {product.unit}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
