"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  '/images/landingpage/hero/Padi.png',
  '/images/landingpage/hero/Ubi.png',
  '/images/landingpage/hero/Jagung.png',
];

export const Hero = () => {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % heroImages.length);
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#FDFDF9] pt-32 pb-16 px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between overflow-hidden">
      <div className="w-full md:w-[50%] z-10 flex flex-col">
        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold text-[#111827] leading-[1.15] tracking-tight">
          Menghubungkan<br />Hasil Panen dengan<br />Kebutuhan Pasar.
        </h1>
        <p className="mt-5 text-base md:text-lg text-gray-600 max-w-[520px] leading-relaxed">
          Platform digital yang mengintegrasikan manajemen hasil pertanian dan akses pasar, membantu petani mengelola panen, menemukan pembeli, serta membangun rantai distribusi yang lebih efisien.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button className="bg-[#0D5C3A] hover:bg-[#0A472C] text-white px-7 py-3.5 rounded-full font-semibold transition-colors">
            Mulai Sekarang
          </button>
          <button className="border border-gray-400 hover:border-[#0D5C3A] text-[#0D5C3A] px-7 py-3.5 rounded-full font-semibold transition-colors">
            Pelajari Cara Kerja
          </button>
        </div>
      </div>

      <div className="w-full md:w-[50%] h-[400px] md:h-[600px] relative mt-12 md:mt-0 overflow-visible flex items-center">
        {heroImages.map((src, i) => {
          const isCurrent = currentImg === i;
          const nextIndex = (currentImg + 1) % heroImages.length;
          const afterNextIndex = (currentImg + 2) % heroImages.length;
          
          const isNext = nextIndex === i;
          const isAfterNext = afterNextIndex === i;
          
          return (
            <div
              key={src}
              className={`absolute top-1/2 -translate-y-1/2 w-[85%] md:w-[95%] h-[80%] md:h-[95%] transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center
                ${isCurrent 
                  ? 'left-0 translate-x-0 scale-100 opacity-100 blur-none z-20' 
                  : isNext 
                    ? 'left-[35%] md:left-[45%] translate-x-0 scale-90 opacity-45 blur-[4px] z-10'
                    : 'left-full translate-x-12 scale-75 opacity-0 blur-lg z-0'
                }
              `}
            >
              <Image
                src={src}
                alt={`Hero Slicing ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                priority={i === 0}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Hero;