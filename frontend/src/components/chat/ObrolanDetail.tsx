'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { DaftarObrolan } from './DaftarObrolan';
import { Percakapan } from './Percakapan';
import type {
  RoleChat,
  KeadaanKoneksi,
  ObrolanListItem,
  PesanChat,
  PercakapanProps,
} from './types';

export interface ObrolanDetailProps {
  conversationId?: string;
  percakapanId?: string;
  keadaan?: KeadaanKoneksi;
  peran?: RoleChat;
  lawanNama?: string;
  lawanOnline?: boolean;
  daftarObrolan?: ObrolanListItem[];
  daftarPesan?: PesanChat[];
  percakapanProps?: Partial<PercakapanProps>;
  onPilihObrolan?: (id: string) => void;
  className?: string;
}

export function ObrolanDetail({
  conversationId,
  percakapanId,
  keadaan = 'normal',
  peran = 'pembeli',
  lawanNama,
  lawanOnline = true,
  daftarObrolan,
  daftarPesan,
  percakapanProps = {},
  onPilihObrolan,
  className = '',
}: ObrolanDetailProps) {
  const targetId = percakapanId ?? conversationId ?? 'ujang';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prevConversationId, setPrevConversationId] = useState(targetId);
  if (targetId !== prevConversationId) {
    setPrevConversationId(targetId);
    setSelectedId(null);
  }
  const activeId = selectedId ?? targetId;

  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkWidth = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 900);
      }
    };

    checkWidth();

    if (rootRef.current && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const sempit = entry.contentRect.width < 900;
          setIsMobile(sempit);
        }
      });
      ro.observe(rootRef.current);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', checkWidth);
      return () => window.removeEventListener('resize', checkWidth);
    }
  }, []);

  const handlePilih = (id: string) => {
    setSelectedId(id);
    if (onPilihObrolan) {
      onPilihObrolan(id);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-h-screen bg-cream font-sans text-ink ${className}`}
    >
      {/* Mobile view (< 900px) */}
      {isMobile ? (
        <div className="min-h-screen flex flex-col">
          <Percakapan
            peran={peran}
            keadaan={keadaan}
            sheet={false}
            sempit={true}
            lawanNama={lawanNama}
            lawanOnline={lawanOnline}
            daftarPesan={daftarPesan}
            {...percakapanProps}
          />
        </div>
      ) : (
        /* Desktop view (>= 900px) */
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <SiteHeader signedIn={true} cartCount={0} />
            <main className="max-w-[1200px] mx-auto px-6 pt-7 pb-16 box-border">
              <div className="flex items-baseline justify-between gap-4 mb-4">
                <h1 className="m-0 text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                  Obrolan
                </h1>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-[400px] shrink-0 min-w-0 box-border">
                  <DaftarObrolan
                    peran={peran}
                    aktif={activeId}
                    sempit={false}
                    daftar={daftarObrolan}
                    onPilih={handlePilih}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Percakapan
                    peran={peran}
                    keadaan={keadaan}
                    sheet={false}
                    sempit={false}
                    lawanNama={lawanNama}
                    lawanOnline={lawanOnline}
                    daftarPesan={daftarPesan}
                    {...percakapanProps}
                  />
                </div>
              </div>
            </main>
          </div>
          <SiteFooter />
        </div>
      )}
    </div>
  );
}
