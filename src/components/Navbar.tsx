'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Home, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-[#0F2B5C] text-white shadow-md border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  TGTC Babel
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-semibold border border-amber-400/30">
                  DJPb
                </span>
              </div>
              <p className="text-xs text-blue-200 hidden sm:block">
                Treasury Goes To Campus • Kanwil DJPb Prov. Kep. Babel
              </p>
            </div>
          </Link>

          {/* Navigation Links: Hanya untuk Peserta, Menu Admin TIDAK DITAMPILKAN */}
          <nav className="flex items-center space-x-1 sm:space-x-3">
            <Link
              href="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Klaim Sertifikat</span>
            </Link>

            <Link
              href="/#cari"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Cari Sertifikat</span>
            </Link>

            {/* Khusus jika sedang berada di halaman /admin, tampilkan badge Admin */}
            {isAdmin && (
              <span className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-900 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Koordinator</span>
              </span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
