'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity">
            TalentDash
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 h-full">
          <Link
            href="/salaries"
            className={`font-semibold text-[15px] h-full flex items-center border-b-2 transition-all ${
              isActive('/salaries')
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-surface-container-highest'
            }`}
          >
            Salaries
          </Link>
          <Link
            href="/companies/google"
            className={`font-semibold text-[15px] h-full flex items-center border-b-2 transition-all ${
              isActive('/companies')
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-surface-container-highest'
            }`}
          >
            Companies
          </Link>
          <Link
            href="/compare"
            className={`font-semibold text-[15px] h-full flex items-center border-b-2 transition-all ${
              isActive('/compare')
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-surface-container-highest'
            }`}
          >
            Compare
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface-variant hover:text-primary w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[26px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface-container-lowest py-3.5 px-4 flex flex-col gap-3">
          <Link
            href="/salaries"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-2 font-medium border-b border-surface-container-low text-sm ${
              isActive('/salaries') ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            Salaries
          </Link>
          <Link
            href="/companies/google"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-2 font-medium border-b border-surface-container-low text-sm ${
              isActive('/companies') ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            Companies
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-2 font-medium text-sm ${
              isActive('/compare') ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            Compare
          </Link>
        </div>
      )}
    </nav>
  );
}
