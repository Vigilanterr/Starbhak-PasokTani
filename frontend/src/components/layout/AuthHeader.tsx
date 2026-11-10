export type AjakanAuth = 'daftar' | 'masuk' | '';

export interface AuthHeaderProps {
  ajakan?: AjakanAuth;
  sempit?: boolean;
  hrefBeranda?: string;
  className?: string;
}

export function AuthHeader({
  ajakan = 'daftar',
  sempit = false,
  hrefBeranda = '/',
  className = '',
}: AuthHeaderProps) {
  const adaAjakan = ajakan !== '';
  const tanya = ajakan === 'masuk' ? 'Sudah punya akun?' : 'Belum punya akun?';
  const labelAjakan = ajakan === 'masuk' ? 'Masuk' : 'Daftar';
  const hrefAjakan = ajakan === 'masuk' ? '/masuk' : '/daftar';

  const paddingClass = sempit
    ? 'px-4 py-3'
    : 'px-4 py-3 min-[900px]:px-10 min-[900px]:py-4';

  return (
    <header
      className={`box-border w-full flex items-center justify-between gap-3 bg-white font-sans ${paddingClass} ${className}`}
    >
      <a
        href={hrefBeranda}
        aria-label="Pasok Tani, ke beranda"
        className="inline-flex items-center gap-2.5 min-h-11 no-underline"
      >
        <span className="w-[34px] h-[34px] rounded-lg bg-brand-900 text-white grid place-items-center font-extrabold text-base">
          🌱
        </span>
        <span className="font-['Bricolage_Grotesque',sans-serif] text-[22px] font-extrabold tracking-tight text-brand-900">
          Pasok<span className="text-[#a8862a]">Tani</span>
        </span>
      </a>

      {adaAjakan && (
        <p className="m-0 flex items-center gap-2.5 text-sm text-[#3f5247]">
          {!sempit && (
            <span className="hidden min-[900px]:inline">
              {tanya}
            </span>
          )}
          <a
            href={hrefAjakan}
            className="inline-flex items-center min-h-11 px-4 border-[1.5px] border-brand-900 rounded-xl text-brand-900 text-[15px] font-bold no-underline whitespace-nowrap hover:bg-cream"
          >
            {labelAjakan}
          </a>
        </p>
      )}
    </header>
  );
}

export default AuthHeader;
