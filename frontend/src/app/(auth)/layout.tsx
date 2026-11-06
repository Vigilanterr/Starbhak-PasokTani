import Link from "next/link";
import type { ReactNode } from "react";
import { IkonDaun } from "./_komponen/ikon";
import { PanelMerek } from "./_komponen/panel-merek";

// TODO (docs/frontend/routes.md): tamu saja. Redirect pengguna yang sudah masuk
// ke beranda dilakukan di src/proxy.ts dan diulang di sini setelah sesi tersedia.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-cream text-ink min-[901px]:grid-cols-[540px_1fr]">
      <PanelMerek />
      <div>
        <header className="flex items-center gap-2.5 bg-brand-900 px-4 py-5 min-[901px]:hidden">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="grid size-9 place-items-center rounded-full bg-mint text-brand-900">
              <IkonDaun size={22} />
            </span>
            <span className="text-base font-semibold text-cream">Pasok Tani</span>
          </Link>
        </header>
        <main className="flex justify-center px-4 pt-8 pb-12 min-[901px]:px-6 min-[901px]:pt-28 min-[901px]:pb-16">
          <div className="flex w-full max-w-100 flex-col gap-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
