'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight hover:scale-105 transition-transform duration-200">
            TalentDash
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 h-full">
          <Link
            href="/salaries"
            className={`font-semibold text-[15px] h-full flex items-center border-b-2 transition-all duration-300 ${
              isActive('/salaries')
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/50'
            }`}
          >
            Salaries
          </Link>
          <Link
            href="/companies/google"
            className={`font-semibold text-[15px] h-full flex items-center border-b-2 transition-all duration-300 ${
              isActive('/companies')
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/50'
            }`}
          >
            Companies
          </Link>
          <Link
            href="/compare"
            className={`font-semibold text-[15px] h-full flex items-center border-b-2 transition-all duration-300 ${
              isActive('/compare')
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/50'
            }`}
          >
            Compare
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface-variant hover:text-primary w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[26px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`md:hidden absolute w-full border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <div className="py-3 px-4 flex flex-col gap-2">
          <Link
            href="/salaries"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
              isActive('/salaries') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            Salaries
          </Link>
          <Link
            href="/companies/google"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
              isActive('/companies') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            Companies
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
              isActive('/compare') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            Compare
          </Link>
        </div>
      </div>
    </nav>
  );
}
