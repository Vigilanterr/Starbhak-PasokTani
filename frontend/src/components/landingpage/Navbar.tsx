"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface NavbarProps {
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropOpen, setMobileDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { name: 'Beranda' },
    { name: 'Fitur', dropdown: ['Fitur Petani', 'Fitur Pembeli'] },
    { name: 'Tentang' },
    { name: 'Testimoni' },
    { name: 'Contact' },
  ];

  const handleNav = (name: string) => {
    setActiveMenu(name);
    setDropdownOpen(false);
    setIsMobileOpen(false);
    if (onNavigate) onNavigate(name);
  };

  return (
    <>
      <nav className={`fixed left-1/2 -translate-x-1/2 z-[999] flex items-center justify-between font-sans select-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? "top-3 md:top-4 w-[92%] md:w-[88%] lg:w-[1000px] py-2.5 px-5 md:px-8 bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 rounded-full" : "top-0 w-full py-4 md:py-5 px-6 md:px-12 lg:px-16 bg-white border-b border-gray-100"}`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNav('Beranda')}>
          <Image src="/images/logo/color-logo-pasoktani.png" alt="Logo" width={36} height={36} className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-7' : 'h-8 md:h-9'}`} priority />
          <span className={`font-bold tracking-tight transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-xl'}`}>
            <span className="text-[#0D5C3A]">Pasok </span>
            <span className="text-[#C2A032]">Tani</span>
          </span>
        </div>

        <div className={`hidden md:flex items-center transition-all duration-500 ${isScrolled ? 'gap-6 lg:gap-8' : 'gap-8 lg:gap-10'}`}>
          {navItems.map((item) => (
            <div key={item.name} className="relative py-2" onMouseEnter={() => item.dropdown && setDropdownOpen(true)} onMouseLeave={() => item.dropdown && setDropdownOpen(false)}>
              <button onClick={() => handleNav(item.name)} className={`flex items-center gap-1.5 relative pb-1 font-semibold transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[2.5px] after:bg-[#0D5C3A] after:rounded-full after:transition-all after:duration-300 ${isScrolled ? 'text-sm' : 'text-base'} ${activeMenu === item.name || item.dropdown?.includes(activeMenu) ? 'text-[#0D5C3A] after:w-full' : 'text-gray-700 hover:text-[#0D5C3A] after:w-0 hover:after:w-full'}`}>
                {item.name}
                {item.dropdown && (
                  <svg className={`stroke-[2] transition-transform ${dropdownOpen ? 'rotate-180 text-[#0D5C3A]' : 'text-gray-500'} ${isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                )}
              </button>
              
              {item.dropdown && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 transition-all duration-300 origin-top ${dropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-gray-100">
                    {item.dropdown.map(sub => (
                      <button key={sub} onClick={(e) => { e.stopPropagation(); handleNav(sub); }} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${activeMenu === sub ? 'bg-[#0D5C3A]/10 text-[#0D5C3A]' : 'text-gray-600 hover:bg-gray-50'}`}>{sub}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => handleNav('Masuk')} className={`hidden md:block bg-[#10B981] hover:bg-[#0D9F6E] text-white font-bold rounded-full transition-transform active:scale-95 shadow-md ${isScrolled ? 'px-5 py-2 text-sm' : 'px-7 py-2.5 text-base'}`}>Masuk</button>
          <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-black/40 z-[990] md:hidden transition-opacity ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileOpen(false)} />
      
      <div className={`fixed top-0 right-0 bottom-0 w-72 bg-white z-[995] shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <span className="font-bold text-xl"><span className="text-[#0D5C3A]">Pasok </span><span className="text-[#C2A032]">Tani</span></span>
          <button onClick={() => setIsMobileOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {navItems.map(item => (
            <div key={item.name} className="flex flex-col">
              <button onClick={() => item.dropdown ? setMobileDropOpen(!mobileDropOpen) : handleNav(item.name)} className={`px-4 py-3 rounded-xl font-semibold flex items-center justify-between ${activeMenu === item.name || item.dropdown?.includes(activeMenu) ? 'bg-[#0D5C3A]/10 text-[#0D5C3A]' : 'text-gray-700 hover:bg-gray-50'}`}>
                {item.name}
                {item.dropdown && <svg className={`w-4 h-4 transition-transform ${mobileDropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
              </button>
              {item.dropdown && mobileDropOpen && (
                <div className="flex flex-col gap-1 pl-4 pr-2 py-2">
                  {item.dropdown.map(sub => (
                    <button key={sub} onClick={() => handleNav(sub)} className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium ${activeMenu === sub ? 'text-[#0D5C3A] bg-[#0D5C3A]/5' : 'text-gray-600 hover:bg-gray-50'}`}>{sub}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => handleNav('Masuk')} className="w-full bg-[#10B981] hover:bg-[#0D9F6E] text-white font-bold py-3.5 rounded-xl">Masuk</button>
        </div>
      </div>
    </>
  );
};

export default Navbar