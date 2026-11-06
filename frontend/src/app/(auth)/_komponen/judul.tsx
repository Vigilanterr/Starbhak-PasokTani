import type { ReactNode } from "react";

export function Judul({ judul, children }: { judul: string; children?: ReactNode }) {
  return (
    <div>
      <h2 className="text-[26px] font-bold tracking-tight text-brand-900 min-[901px]:text-[30px]">
        {judul}
      </h2>
      {children && (
        <p className="mt-2 text-[15px] leading-normal text-muted">{children}</p>
      )}
    </div>
  );
}
