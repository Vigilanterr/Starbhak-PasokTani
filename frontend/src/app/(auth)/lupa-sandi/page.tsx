import type { Metadata } from "next";
import { FormLupaSandi } from "../_komponen/form-lupa-sandi";

export const metadata: Metadata = { title: "Lupa kata sandi" };

export default function Page() {
  return <FormLupaSandi />;
}
