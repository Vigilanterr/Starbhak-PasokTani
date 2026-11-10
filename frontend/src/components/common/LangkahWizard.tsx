'use client';

export interface LangkahItem {
  judul: string;
  deskripsi?: string;
}

export interface LangkahWizardProps {
  /** Active step index (1-based) OR array of step objects */
  langkah?: number | LangkahItem[];
  langkahAktif?: number;
  totalLangkah?: number;
  sempit?: boolean;
  judul?: string[];
  label?: string;
  onPilih?: (langkah: number) => void;
  onPilihLangkah?: (idx: number) => void;
  className?: string;
}

const DEFAULT_TITLES = ['Info produk', 'Foto dan harga', 'Stok pertama'];

export function LangkahWizard({
  langkah = 1,
  langkahAktif,
  totalLangkah: totalProp,
  sempit = false,
  judul: judulProp,
  label = 'Proses formulir bertahap',
  onPilih,
  onPilihLangkah,
  className = '',
}: LangkahWizardProps) {
  // Normalize items and step numbers
  let stepTitles = judulProp ?? DEFAULT_TITLES;
  if (Array.isArray(langkah)) {
    stepTitles = langkah.map((l) => l.judul);
  }

  const total = totalProp ?? stepTitles.length;

  let activeStep = 1;
  if (typeof langkahAktif === 'number') {
    activeStep = langkahAktif;
  } else if (typeof langkah === 'number') {
    activeStep = langkah;
  }
  // Clamp between 1 and total
  activeStep = Math.min(Math.max(activeStep, 1), total);

  const handleStepSelect = (step: number) => {
    onPilih?.(step);
    onPilihLangkah?.(step - 1);
  };

  const currentJudul = stepTitles[activeStep - 1] ?? `Langkah ${activeStep}`;
  const nextJudul = activeStep < total ? (stepTitles[activeStep] ? `Berikutnya: ${stepTitles[activeStep]}` : '') : 'Langkah terakhir';

  if (sempit) {
    return (
      <nav
        aria-label={label}
        className={`w-full font-sans text-ink flex flex-col gap-2 ${className}`}
      >
        <p className="m-0 flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-bold text-[#3f5247]">
            Langkah {activeStep} dari {total}
          </span>
          <span className="text-xs text-[#5a6b60]">{nextJudul}</span>
        </p>
        <p aria-current="step" className="m-0 text-[17px] font-extrabold text-ink">
          {currentJudul}
        </p>
        <div aria-hidden="true" className="flex gap-1.5">
          {Array.from({ length: total }, (_, i) => {
            const stepNum = i + 1;
            let barColor = 'bg-[#dee3da]';
            if (stepNum < activeStep) {
              barColor = 'bg-[#064e3b]';
            } else if (stepNum === activeStep) {
              barColor = 'bg-[#157a4c]';
            }
            return (
              <span
                key={stepNum}
                className={`flex-1 h-1.5 rounded-full ${barColor}`}
              />
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label={label}
      className={`w-full font-sans text-ink ${className}`}
    >
      <ol className="list-none m-0 p-0 flex items-center gap-3 w-full">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < activeStep;
          const isCurrent = stepNum === activeStep;
          const title = stepTitles[i] ?? `Langkah ${stepNum}`;
          const isLast = stepNum === total;

          const hasClick = (onPilih !== undefined || onPilihLangkah !== undefined) && (isCompleted || isCurrent);

          return (
            <li
              key={stepNum}
              className={`min-w-0 flex items-center gap-3 ${isLast ? 'flex-initial' : 'flex-1'}`}
            >
              {hasClick && isCompleted ? (
                <button
                  type="button"
                  onClick={() => handleStepSelect(stepNum)}
                  className="shrink-0 inline-flex items-center gap-2.5 min-h-[44px] pr-1.5 border-0 rounded-xl bg-transparent text-ink text-left cursor-pointer focus-visible:outline-3 focus-visible:outline-[#157a4c]"
                  aria-label={`Lompat ke langkah ${stepNum}: ${title}`}
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#064e3b] text-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-sm font-bold text-ink underline decoration-[#a9cfae] underline-offset-[3px] whitespace-nowrap">
                    {title}
                  </span>
                </button>
              ) : (
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className="shrink-0 inline-flex items-center gap-2.5 min-h-[44px] pr-1.5"
                >
                  <span
                    aria-hidden="true"
                    className={`shrink-0 w-8 h-8 rounded-full grid place-items-center text-sm ${
                      isCompleted
                        ? 'bg-[#064e3b] text-white'
                        : isCurrent
                        ? 'bg-white border-[2.5px] border-[#064e3b] text-[#064e3b] font-extrabold'
                        : 'bg-white border-2 border-[#c9d2c6] text-[#5a6b60] font-extrabold'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </span>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      isCurrent
                        ? 'font-extrabold text-ink'
                        : isCompleted
                        ? 'font-bold text-ink'
                        : 'font-semibold text-[#5a6b60]'
                    }`}
                  >
                    {title}
                  </span>
                </div>
              )}

              {/* Dotted connector to next step */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="flex-1 min-w-6 border-t-2 border-dotted"
                  style={{ borderColor: isCompleted ? '#c2a032' : '#c9d2c6' }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default LangkahWizard;
