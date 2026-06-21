'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/salaries', label: 'Salaries' },
  { href: '/companies', label: 'Companies' },
  { href: '/compare', label: 'Compare' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-[#EBEBEB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-[#FF5A5F] tracking-tight">
              TalentDash
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'text-[#FF5A5F]'
                      : 'text-[#484848] hover:text-[#222222]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/salaries"
              className="bg-[#FF5A5F] hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Explore Salaries
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
