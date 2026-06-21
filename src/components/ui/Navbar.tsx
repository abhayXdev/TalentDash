'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity">
            TalentDash
          </Link>
          
          <div className="hidden md:flex relative max-w-xs w-64 ml-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-surface-container-low border border-surface-container-highest rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search companies or roles..."
            />
          </div>
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
          <button className="text-sm font-semibold px-4 py-1.5 border border-on-surface rounded-md text-on-surface hover:bg-surface-container-low transition-colors hidden sm:block">
            Sign In
          </button>

          <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[26px]">
              account_circle
            </span>
          </button>
          
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
          <div className="relative w-full mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-surface-container-highest rounded-full text-sm focus:outline-none focus:border-primary"
              placeholder="Search companies or roles..."
            />
          </div>
          
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
