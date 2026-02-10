'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { ShoppingBag, User, ChevronDown, LogOut, Store, Search, CreditCard, ShoppingCart } from 'lucide-react';

export default function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [profile, setProfile] = useState<any>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Sync query URL → input
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSeller, resProfile] = await Promise.all([
          axios.get('/api/seller/check'),
          axios.get('/api/profile')
        ]);
        setIsSeller(resSeller.data.exists);
        setProfile(resProfile.data);
      } catch (err: any) {
        if (err.response?.status === 401) router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    router.push(
      query
        ? `/products?q=${encodeURIComponent(query)}`
        : `/products`
    );
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 px-4 md:px-8 py-2.5 flex items-center gap-6 shadow-xl border-b border-white/10">
      
      {/* KIRI: Logo */}
      <div className="flex-shrink-0 mr-4 md:mr-8">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-white">
          <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-md border border-white/30 shadow-inner">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="hidden lg:block tracking-tighter">BelanjaAja</span>
        </Link>
      </div>

      {/* TENGAH: Search */}
      <form onSubmit={handleSearch} className="flex-1 group relative">
        <input 
          type="text"
          placeholder="Cari produk favorit Anda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-800 text-sm pl-11 pr-4 py-2.5 rounded outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-slate-400 font-medium border-none shadow-md"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
      </form>

      {/* KANAN */}
      <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
        
        {/* Cart */}
        <Link 
          href="/user/cart" 
          className={`p-2 rounded-md transition-all ${isActive('/user/cart') ? 'text-white' : 'text-indigo-100'} hover:bg-white/10`}
        >
          <ShoppingCart size={24} />
        </Link>

        {/* Upgrade Seller */}
        {!loading && !isSeller && (
          <Link 
            href="/user/register-seller" 
            className="hidden sm:flex text-[11px] font-bold text-white bg-white/10 border border-white/20 px-4 py-2.5 rounded-md hover:bg-white/20 transition-all items-center gap-2 backdrop-blur-sm whitespace-nowrap uppercase tracking-wider shadow-sm"
          >
            <Store size={14} />
            Upgrade Account
          </Link>
        )}

        {/* Dropdown */}
        {loading ? (
          <div className="h-10 w-10 bg-white/10 animate-pulse rounded-md"></div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 p-1 rounded-md transition-all border ${isDropdownOpen ? 'border-white/40 bg-white/10' : 'border-transparent hover:bg-white/10'}`}
            >
              <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-900 font-bold">
                <User size={18} />
              </div>
              <ChevronDown size={14} className={`text-indigo-200 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl py-2 z-50 overflow-hidden text-slate-700 animate-in fade-in zoom-in duration-100">
                
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">Halo,</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{profile?.name}</p>
                </div>
                
                <Link 
                  href="/user/profile" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={14} /> Profil Akun
                </Link>

                <Link 
                  href="/user/orders" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <CreditCard size={14} /> Pesanan Saya
                </Link>
                
                {isSeller && (
                  <Link 
                    href="/seller/dashboard" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 font-bold hover:bg-emerald-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Store size={14} /> Dashboard Toko
                  </Link>
                )}
                
                <hr className="my-1 border-slate-100" />

                <button 
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setIsDropdownOpen(false);
                    router.replace('/auth/login');
                    router.refresh();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
                >
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
