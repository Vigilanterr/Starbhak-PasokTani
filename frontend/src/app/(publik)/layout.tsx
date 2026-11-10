import type { ReactNode } from "react";
import { Suspense } from "react";
import { FooterSitus } from "../_komponen/footer-situs";
import { HeaderSesi } from "../_komponen/header-sesi";
import { HeaderSitus } from "../_komponen/header-situs";

/** Header tamu langsung tampil. Header dengan keadaan masuk menyusul setelah backend menjawab. */
export default function PublikLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<HeaderSitus />}>
        <HeaderSesi />
      </Suspense>
      <main className="flex-1">{children}</main>
      <FooterSitus />
    </>
  );
}
