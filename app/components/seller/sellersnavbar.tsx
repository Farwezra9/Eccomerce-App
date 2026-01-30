'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { LogOut, User, ChevronDown, ArrowLeft } from 'lucide-react';

export default function SellerNavbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mengambil data dari route profile yang sudah kamu punya
        const res = await axios.get('/api/seller/profile');
        setProfile(res.data);
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  // Logika penentuan warna status berdasarkan data database
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-400';
      case 'inactive': return 'bg-slate-400';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-emerald-400';
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-3 flex items-center justify-between shadow-lg border-b border-white/10">
      
      {/* KIRI: Status & Back Button */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <p className="text-[9px] text-blue-200/60 uppercase font-bold tracking-widest leading-none mb-1.5">Status Toko</p>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
            <div className={`h-1.5 w-1.5 ${getStatusColor(profile?.status)} rounded-full ${profile?.status === 'active' || !profile ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] text-white font-bold uppercase tracking-wide">
              {loading ? 'Loading...' : (profile?.status)}
            </span>
          </div>
        </div>

        <Link 
          href="/" 
          className="group flex items-center gap-2 px-4 py-2 bg-blue-800/40 hover:bg-blue-800/60 text-white text-xs font-medium rounded-xl transition-all border border-white/10"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Lihat Toko
        </Link>
      </div>

      {/* KANAN: User Profile */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 p-1.5 rounded-full transition-all border ${
            isDropdownOpen ? 'border-white/40 bg-white/10' : 'border-transparent hover:bg-white/10'
          }`}
        >
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-inner border border-white/20">
            {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <User size={16} />}
          </div>
          <div className="text-left hidden sm:block text-white">
            <p className="text-xs font-bold leading-none">
              {loading ? 'Loading...' : (profile?.shop_name)}
            </p>
            <p className="text-[10px] text-blue-200 mt-1 font-medium opacity-80 uppercase tracking-tighter">Verified Store</p>
          </div>
          <ChevronDown size={14} className={`text-blue-200 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 overflow-hidden text-slate-700 animate-in fade-in zoom-in duration-100">
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Manajemen</p>
            </div>
            <Link href="/seller/settings" className="block px-4 py-2 text-sm hover:bg-slate-50 transition-colors">Pengaturan Toko</Link>
            <Link href="/user/profile" className="block px-4 py-2 text-sm hover:bg-slate-50 transition-colors">Profil Personal</Link>
            <hr className="my-1 border-slate-100" />
            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}