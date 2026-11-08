import Image from "next/image";
import Link from "next/link";

const RUTE = "M452 92 C 400 128, 330 120, 300 168 S 360 250, 300 290 S 150 300, 160 360 S 130 420, 92 432";

const PANAH = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const SUDUT: React.CSSProperties = {
  position: "absolute",
  width: 28,
  height: 28,
  background: "radial-gradient(circle at 0 0, transparent 27.5px, #ffffff 28px)",
};

export function HeroLanding() {
  return (
    <section
      aria-labelledby="judul-hero"
      className="relative mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-16 gap-y-10 px-5 pt-8 pb-16 md:px-10 md:pt-12 md:pb-26"
    >
      <div className="relative min-w-0 flex-[1_1_440px]">
        <p className="m-0 inline-flex items-center gap-2 rounded-full bg-tint py-1.75 pr-3.5 pl-2.5 text-sm font-bold text-brand-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Pasar hasil tani Jawa Barat
        </p>
        <h1
          id="judul-hero"
          className="mt-5.5 m-0 font-extrabold tracking-[-0.035em] text-[#10291e]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(46px, 6.6vw, 96px)", lineHeight: 0.96 }}
        >
          Dari ladang, langsung ke dapur.
        </h1>
        <p className="mt-6 mb-0 max-w-[470px] text-[18px] leading-[1.6] text-[#4d5f54]">
          Beli sayur, beras, dan bumbu langsung dari petani Jawa Barat. Setiap produk mencantumkan foto stok asli dan tanggal panennya.
        </p>
        <div className="mt-8.5 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link
            href="/produk"
            className="group inline-flex h-15.5 items-center gap-4.5 rounded-full bg-[#064e3b] py-0 pr-2 pl-7.5 text-[17px] font-bold text-white no-underline shadow-[0_14px_30px_rgba(6,78,59,0.22)]"
          >
            Mulai belanja
            <span aria-hidden="true" className="inline-flex size-11.5 items-center justify-center rounded-full bg-[#e9c75c] text-[#064e3b] transition-transform duration-200 group-hover:translate-x-1">
              {PANAH}
            </span>
          </Link>
          <Link href="/daftar/petani" className="inline-flex min-h-11 items-center gap-2 text-base font-bold underline-offset-[5px] hover:underline">
            Saya petani, mau jual
          </Link>
        </div>
        <ul className="mt-7.5 mb-0 flex list-none flex-wrap gap-x-5.5 gap-y-2 p-0 text-sm text-[#4d5f54]">
          <li className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Dana ditahan sampai pesanan diterima
          </li>
          <li className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
              <circle cx="17" cy="18" r="2" />
              <circle cx="7" cy="18" r="2" />
            </svg>
            Kirim ke seluruh Jawa Barat
          </li>
        </ul>
      </div>

      <figure className="relative m-0 min-w-0 flex-[1_1_500px] aspect-[6/5] max-w-160">
        <div className="jalur-foto absolute inset-0 overflow-hidden rounded-[36px]">
          <Image
            src="/images/landingpage/hero/sawah-terasering.png"
            alt="Sawah terasering hijau dengan pondok-pondok petani"
            fill
            priority
            sizes="(min-width: 1024px) 640px, 90vw"
            className="object-cover"
          />
        </div>
        <svg viewBox="0 0 600 500" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <mask id="jalur-mask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="640" height="540">
              <path className="jalur-rute" d={RUTE} fill="none" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
            </mask>
          </defs>
          <path d={RUTE} mask="url(#jalur-mask)" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="0 11" />
          <circle className="jalur-pin" style={{ animationDelay: "380ms" }} cx="452" cy="92" r="11" fill="#ffffff" />
          <circle className="jalur-pin" style={{ animationDelay: "440ms" }} cx="452" cy="92" r="6" fill="#157a4c" />
          <circle className="jalur-pin" style={{ animationDelay: "960ms" }} cx="300" cy="290" r="8" fill="#ffffff" />
          <circle className="jalur-pin" style={{ animationDelay: "1520ms" }} cx="92" cy="432" r="13" fill="#e9c75c" stroke="#ffffff" strokeWidth="4" />
        </svg>
        <p className="jalur-label absolute top-[3%] left-[56%] m-0 hidden items-center gap-2.5 rounded-full bg-[rgba(16,41,30,0.72)] py-1.75 pr-3.5 pl-1.75 text-[13px] leading-snug text-white backdrop-blur-[6px] sm:flex" style={{ animationDelay: "500ms" }}>
          <span aria-hidden="true" className="inline-flex size-7.5 items-center justify-center rounded-full bg-tint text-[#157a4c]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
          </span>
          <span>
            <b className="block font-bold">Dipanen</b>6 Nov, pagi
          </span>
        </p>
        <p className="jalur-label absolute top-[54%] left-[53%] m-0 hidden rounded-full bg-[rgba(16,41,30,0.72)] px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-[6px] sm:block" style={{ animationDelay: "1060ms" }}>
          Dikemas petani
        </p>
        <p className="jalur-label absolute top-[72%] left-[4%] m-0 hidden rounded-full bg-white px-3 py-1.5 text-[13px] font-bold text-[#10291e] shadow-[0_6px_18px_rgba(16,41,30,0.18)] sm:block" style={{ animationDelay: "1600ms" }}>
          Tiba di dapur Anda, 7 Nov
        </p>

        <span aria-hidden="true" className="absolute right-0 bottom-23 hidden size-7 sm:block" style={{ ...SUDUT, animationDelay: "700ms" }} />
        <span aria-hidden="true" className="absolute right-68 bottom-0 hidden size-7 sm:block" style={SUDUT} />
        <div className="absolute right-0 bottom-0 hidden h-23 w-68 items-center gap-3 rounded-tl-[28px] bg-white pt-4.5 pl-5.5 sm:flex">
          <span aria-hidden="true" className="flex">
            {["AS", "DN", "RH"].map((ini, i) => (
              <span
                key={ini}
                className={`inline-flex size-10 items-center justify-center rounded-full border-[3px] border-white text-[13px] font-extrabold ${i ? "-ml-3" : ""} ${
                  i === 0 ? "bg-[#d5f6d5] text-[#064e3b]" : i === 1 ? "bg-[#f5eed6] text-[#6b5414]" : "bg-[#064e3b] text-white"
                }`}
              >
                {ini}
              </span>
            ))}
          </span>
          <span className="leading-tight">
            <b className="block text-[22px] font-extrabold text-[#10291e]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              [jumlah]
            </b>
            <span className="whitespace-nowrap text-xs text-[#4d5f54]">petani terverifikasi</span>
          </span>
        </div>

        <svg className="jalur-bintang absolute top-[18%] -left-11.5 text-[#10291e]" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" style={{ animationDelay: "1760ms" }}>
          <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="currentColor" />
        </svg>
        <svg className="jalur-bintang absolute top-[34%] -right-7 text-[#c2a032]" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ animationDelay: "1900ms" }}>
          <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="currentColor" />
        </svg>
      </figure>
    </section>
  );
}
