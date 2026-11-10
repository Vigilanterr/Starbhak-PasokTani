import type { Metadata } from "next";
import { FormMasuk } from "../_komponen/form-masuk";

export const metadata: Metadata = { title: "Masuk" };

export default function Page() {
  return <FormMasuk />;
}
