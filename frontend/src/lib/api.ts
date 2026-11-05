export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000").replace(/\/$/, "");

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: "ADMIN" | "FARMER" | "BUYER";
  status: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  fotoProfile: string | null;
  address: string | null;
  bio: string | null;
  village: string | null;
  farmingExperience: string | null;
  farmArea: string | null;
}

export interface FarmerProfile extends User {
  farmingMethod?: string | null;
  createdAt?: string;
  productCount: number;
  reviewCount: number;
  rating: number;
  completedOrders: number;
  totalSold: number;
  achievementCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: string;
  unit: string;
  quality: string;
  location: string;
  status: string;
  rating: string;
  review_count: number;
  image: string | null;
  category_name: string;
  farmer_name?: string;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_name: string;
  buyer_foto: string | null;
}

export type AchievementStatus = "ACHIEVED" | "FEATURED" | "REVOKED";

export interface Achievement {
  id: number;
  farmerId: number;
  farmerName?: string;
  farmerVillage?: string | null;
  title: string;
  description: string;
  badgeIcon: string | null;
  attainedAt: string;
  status: AchievementStatus;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pt_token");
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? `Permintaan gagal (${response.status})`);
  }
  return payload;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const formatRupiah = (value: number | string) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

export const formatNumber = (value: number | string) => new Intl.NumberFormat("id-ID").format(Number(value));
