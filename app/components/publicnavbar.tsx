'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Search, ShoppingCart } from 'lucide-react';

export default function PublicNavbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : `/`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 shadow-xl border-b border-white/10">
      <div className="max-w-[1600px] mx-auto px-3 md:px-8 py-3">
        
        {/* BARIS UTAMA */}
        <div className="flex items-center justify-between gap-2 md:gap-8">
          
          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 md:gap-3 text-white">
              <div className="bg-white/20 backdrop-blur-md p-1 rounded-md border border-white/30 shadow-inner">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-base md:text-xl font-bold tracking-tighter">BelanjaAja</span>
            </Link>
          </div>

          {/* SEARCH DESKTOP (Hidden di HP) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 group relative">
            <input 
              type="text"
              placeholder="Cari produk impian Anda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-sm pl-11 pr-4 py-2.5 rounded outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </form>

          {/* ACTION BUTTONS (KERANJANG, LOGIN, DAFTAR) */}
          <div className="flex items-center gap-1 md:gap-4">
            
            {/* Keranjang */}
            <Link 
              href="/auth/login" 
              className="p-1.5 md:p-2 rounded-md text-indigo-100 hover:bg-white/10 transition-all"
            >
              <ShoppingCart size={22} />
            </Link>

            {/* Garis Pembatas */}
            <div className="h-6 w-[1px] bg-white/20 mx-1"></div>

            {/* Tombol Masuk */}
            <Link 
              href="/auth/login"
              className="text-xs md:text-sm font-semibold text-white hover:text-indigo-200 px-2 py-2"
            >
              Masuk
            </Link>

            {/* TOMBOL DAFTAR (Sekarang Muncul di HP & Desktop) */}
            <Link 
              href="/auth/register"
              className="text-xs md:text-sm font-bold text-indigo-900 bg-white px-3 md:px-5 py-2 rounded hover:bg-indigo-50 transition-all shadow-md whitespace-nowrap"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* SEARCH MOBILE (Muncul hanya di HP) */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-sm pl-10 pr-4 py-2.5 rounded outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </form>
        </div>
        
      </div>
    </nav>
  );
}