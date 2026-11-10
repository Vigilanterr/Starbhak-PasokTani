import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

function Dasar({ size = 20, children, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IkonDaun = (p: Props) => (
  <Dasar {...p}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </Dasar>
);

export const IkonMata = (p: Props) => (
  <Dasar {...p}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </Dasar>
);

export const IkonMataCoret = (p: Props) => (
  <Dasar {...p}>
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </Dasar>
);

export const IkonPeringatan = (p: Props) => (
  <Dasar {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 18h.01" />
  </Dasar>
);

export const IkonInfo = (p: Props) => (
  <Dasar {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Dasar>
);

export const IkonSurat = (p: Props) => (
  <Dasar {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Dasar>
);

export const IkonPanahKiri = (p: Props) => (
  <Dasar {...p}>
    <path d="m12 19-7-7 7-7M19 12H5" />
  </Dasar>
);

export const IkonPanahKanan = (p: Props) => (
  <Dasar {...p}>
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </Dasar>
);

export const IkonPanahBawah = (p: Props) => (
  <Dasar {...p}>
    <path d="m6 9 6 6 6-6" />
  </Dasar>
);

export function IkonCentangBulat({ size = 16, ...rest }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <circle cx="12" cy="12" r="11" fill="#1e8b5a" />
      <path d="M17 8.5 10.5 15 7 11.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IkonBulatKosong({ size = 16, ...rest }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <circle cx="12" cy="12" r="10" stroke="#7d877e" strokeWidth="2" />
    </svg>
  );
}

export function IkonGoogle({ size = 20, ...rest }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" {...rest}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
