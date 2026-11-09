import type { Metadata } from "next";
import { FormLengkapi } from "../../_komponen/form-lengkapi";

export const metadata: Metadata = { title: "Lengkapi profil" };

export default function Page() {
  return <FormLengkapi />;
}
