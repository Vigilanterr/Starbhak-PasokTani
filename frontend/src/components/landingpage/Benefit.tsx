"use client";

import React from 'react';
import Image from 'next/image';

export const Benefit = () => {
  return (
    <section className="relative w-full bg-[#F3F8F5] pt-24 pb-32 px-6 md:px-12 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
        
        <div className="w-full lg:w-1/2 flex flex-col">
          <span className="text-[#0D5C3A] font-bold text-xl md:text-2xl mb-4">
            Kenapa Pasok Tani?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[#111827] leading-[1.2] tracking-tight mb-6">
            Rantai distribusi yang panjang menciptakan biaya yang tidak perlu
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-[500px]">
            Terlalu banyak perantara dalam rantai pasok pertanian menyebabkan harga menjadi lebih tinggi, petani mendapatkan margin yang kecil, dan pembeli harus membayar lebih mahal.
          </p>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-semibold text-sm mb-8">
              Sebelum <span className="font-normal">(Rantai distribusi lama)</span>
            </h3>
            
            <div className="relative flex justify-between items-center z-10 px-2">
              <div className="absolute top-[35%] left-4 right-4 h-[2px] bg-gray-200 -z-10" />
              
              {[
                { label: 'Petani', icon: '/images/landingpage/Benefit/Farmer.svg' },
                { label: 'Pengumpul', icon: '/images/landingpage/Benefit/Pengumpul.svg' },
                { label: 'Pedagang', icon: '/images/landingpage/Benefit/Marketplace.svg' },
                { label: 'Distributor', icon: '/images/landingpage/Benefit/Distributor.svg' },
                { label: 'Pembeli', icon: '/images/landingpage/Benefit/Penerima.svg' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center shadow-sm">
                    <Image src={item.icon} alt={item.label} width={24} height={24} className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs md:text-sm text-red-600 font-medium bg-red-50/80 p-3 rounded-xl">
              <span>Banyak perantara</span>
              <span>→</span>
              <span>Lebih banyak biaya</span>
              <span>→</span>
              <span>Harga semakin tinggi</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(13,92,58,0.06)] border border-[#0D5C3A]/15">
            <h3 className="text-[#0D5C3A] font-bold text-sm mb-8">
              Dengan Pasok Tani <span className="font-medium text-gray-500">(Rantai distribusi lebih efisien)</span>
            </h3>
            
            <div className="relative flex justify-between items-center z-10 px-6">
              <div className="absolute top-[35%] left-12 right-12 h-[2px] bg-[#10B981] -z-10" />
              
              {[
                { label: 'Petani', icon: '/images/landingpage/Benefit/Farmer.svg' },
                { label: 'Distributor', icon: '/images/landingpage/Benefit/Distributor.svg' },
                { label: 'Pembeli', icon: '/images/landingpage/Benefit/Penerima.svg' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0D5C3A] text-white flex items-center justify-center shadow-md ring-4 ring-white">
                    <Image src={item.icon} alt={item.label} width={28} height={28} className="w-7 h-7 object-contain brightness-0 invert" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-[#0D5C3A]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-6xl bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 z-20">
        {[
          'Hubungan langsung',
          'Informasi pasokan terbuka',
          'Pengadaan lebih terencana'
        ].map((text, i) => (
          <div key={i} className="flex-1 p-6 flex items-center justify-center gap-4 hover:bg-gray-50 transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-sm md:text-base">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefit;