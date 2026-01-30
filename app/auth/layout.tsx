'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* SISI KIRI: Visual & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center p-12">
        {/* Dekorasi Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[120px] opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl mb-8">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none italic uppercase">
            Belanja Aman <br /> 
            <span className="text-indigo-400">Tanpa Was-was.</span>
          </h2>
          <p className="mt-6 text-indigo-100/70 text-lg font-medium leading-relaxed">
            Bergabunglah dengan ribuan pengguna lainnya dan nikmati pengalaman belanja dengan sistem keamanan transaksi terbaik.
          </p>
          
          {/* Stats Badge */}
          <div className="mt-12 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-black text-white">50k+</p>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Users</p>
            </div>
            <div className="text-center border-x border-white/10 px-8">
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Aman</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Support</p>
            </div>
          </div>
        </div>

        {/* Floating Brand Name */}
<Link 
  href="/" 
  className="absolute bottom-10 left-10 group transition-transform hover:scale-105 active:scale-95"
>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-indigo-50 transition-colors">
      <ShoppingBag className="text-indigo-900" size={16} />
    </div>
    <span className="text-white font-black tracking-tighter drop-shadow-md">
      BelanjaAja
    </span>
  </div>
</Link>
</div>

      {/* SISI KANAN: Form (Halaman Login/Register Anda) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}