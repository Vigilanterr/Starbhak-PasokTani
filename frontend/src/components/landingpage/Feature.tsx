"use client";

import React, { useState } from 'react';

export const Feature = () => {
  const [activeTab, setActiveTab] = useState<'petani' | 'pembeli'>('petani');

  const petaniFeatures = [
    {
      num: "01",
      title: "Akses Pasar Lebih Luas",
      desc: "Jangkau mitra pembeli dari berbagai wilayah untuk memperluas peluang penjualan hasil panen.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      num: "02",
      title: "Peluang Penjualan Meningkat",
      desc: "Proses distribusi hasil panen menjadi lebih cepat, terorganisir, dan mudah dipantau.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      num: "03",
      title: "Kelola Produk dengan Mudah",
      desc: "Bertransaksi dengan jaringan mitra pembeli terverifikasi untuk meningkatkan kepercayaan.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      num: "04",
      title: "Tingkatkan Pendapatan",
      desc: "Pantau aktivitas penjualan dan distribusi melalui laporan yang tersusun secara rapi.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const pembeliFeatures = [
    {
      num: "01",
      title: "Temukan Produk Berkualitas",
      desc: "Dapatkan hasil panen segar langsung dari petani terpercaya.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      num: "02",
      title: "Pencarian Lebih Mudah",
      desc: "Cari produk berdasarkan kategori, lokasi, atau kebutuhan dengan cepat.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      num: "03",
      title: "Pemesanan Praktis",
      desc: "Lakukan pemesanan hasil panen dengan proses yang mudah dan efisien.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      num: "04",
      title: "Terhubung Langsung dengan Petani",
      desc: "Temukan hasil panen langsung dari petani dalam satu platform yang mudah dan terpercaya.",
      icon: (
        <svg className="w-5 h-5 text-[#0D5C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const currentFeatures = activeTab === 'petani' ? petaniFeatures : pembeliFeatures;

  return (
    <section className="relative w-full bg-[#FAFBF9] py-24 px-6 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        <div className="text-center max-w-2xl mb-10">
          <span className="text-[#0D5C3A] font-bold text-sm md:text-base uppercase tracking-wider bg-[#0D5C3A]/10 px-4 py-1.5 rounded-full inline-block mb-4">
            Fitur Unggulan
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight mb-4">
            Solusi Terintegrasi untuk Petani & Pembeli
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Dirancang khusus untuk memangkas rantai pasok dan memaksimalkan efisiensi ekosistem pertanian digital.
          </p>
        </div>

        <div className="flex bg-gray-200/60 p-1.5 rounded-full mb-12">
          <button
            onClick={() => setActiveTab('petani')}
            className={`px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 ${
              activeTab === 'petani'
                ? 'bg-[#0D5C3A] text-white shadow-md'
                : 'text-gray-600 hover:text-[#0D5C3A]'
            }`}
          >
            Fitur Petani
          </button>
          <button
            onClick={() => setActiveTab('pembeli')}
            className={`px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 ${
              activeTab === 'pembeli'
                ? 'bg-[#0D5C3A] text-white shadow-md'
                : 'text-gray-600 hover:text-[#0D5C3A]'
            }`}
          >
            Fitur Pembeli
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {currentFeatures.map((feature) => (
            <div
              key={feature.num}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0D5C3A]/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold text-[#0D5C3A] bg-[#0D5C3A]/10 px-2.5 py-1 rounded-md">
                    {feature.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Feature;