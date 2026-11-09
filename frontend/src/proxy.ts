import { NextResponse, type NextRequest } from "next/server";

/**
 * Early redirects only, from the cookie. Neon Auth's cookies are __Secure-neon-auth.*. A stale cookie can
 * send someone to the wrong page once, which is harmless. The backend decides who is really signed in.
 * Missing profiles are handled by /daftar/lengkapi, which checks /api/v1/me itself.
 */
const PREFIX_SESI = "__Secure-neon-auth.";

/** Halaman untuk tamu. Orang yang sudah masuk diteruskan ke beranda. */
const HANYA_TAMU = ["/masuk", "/daftar", "/lupa-sandi", "/atur-ulang-sandi"];

/** Halaman yang butuh sesi. Tanpa sesi, dikirim ke masuk dengan tujuan kembali. */
const BUTUH_SESI = ["/daftar/lengkapi"];

const cocok = (path: string, daftar: string[]) =>
  daftar.some((awal) => path === awal || path.startsWith(`${awal}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const masukSesi = request.cookies.getAll().some((c) => c.name.startsWith(PREFIX_SESI));

  if (cocok(pathname, BUTUH_SESI) && !masukSesi) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("lanjut", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // /daftar/lengkapi juga berawalan /daftar, tetapi harus bisa dibuka orang yang sudah masuk.
  if (cocok(pathname, HANYA_TAMU) && !cocok(pathname, BUTUH_SESI) && masukSesi) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/masuk", "/daftar/:path*", "/lupa-sandi", "/atur-ulang-sandi"],
};
