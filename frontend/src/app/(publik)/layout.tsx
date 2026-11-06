import type { ReactNode } from "react";
import { FooterSitus } from "../_komponen/footer-situs";
import { HeaderSitus } from "../_komponen/header-situs";

export default function PublikLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderSitus />
      <main className="flex-1">{children}</main>
      <FooterSitus />
    </>
  );
}
