"use client";

import { useEffect } from "react";

/**
 * Animasi sekali saat tahap masuk layar: garis putus-putus "jalur panen" turun satu kali.
 * Hanya di desktop; di ponsel dan bagi yang meminta gerak dikurangi, semua tahap langsung tampil utuh.
 */
export function AnimasiGulir() {
  useEffect(() => {
    const tahap = document.querySelectorAll<HTMLElement>("[data-tahap]");
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 768px)").matches;

    if (kurangiGerak || !desktop || !("IntersectionObserver" in window)) {
      tahap.forEach((el) => (el.dataset.terlihat = "ya"));
      return;
    }

    const io = new IntersectionObserver(
      (entri) => {
        entri.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.terlihat = "ya";
          io.unobserve(e.target);
        });
      },
      { threshold: 0.15 },
    );
    tahap.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
