import type { Metadata } from "next";
import { FormAturUlang } from "../_komponen/form-atur-ulang";

export const metadata: Metadata = { title: "Atur ulang kata sandi" };

export default function Page() {
  return <FormAturUlang />;
}
