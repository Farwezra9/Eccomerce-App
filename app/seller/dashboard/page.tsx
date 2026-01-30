'use client';

import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingBag, 
  Users, TrendingUp 
} from 'lucide-react';

export default function SellerDashboard() {
  const router = useRouter();

  return (
     <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            Dashboard Toko
          </h1>
          <p className="text-slate-500 text-sm">
            Pantau ringkasan performa penjualan Anda hari ini.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all active:scale-95">
            Download Laporan
          </button>
          <button 
            onClick={() => router.push('/seller/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Produk" value="128" icon={<Package size={20} />} trend="+4 baru" color="blue" delay="delay-0" />
        <StatCard title="Pesanan Baru" value="12" icon={<ShoppingBag size={20} />} trend="Perlu dikirim" color="emerald" delay="delay-[150ms]" />
        <StatCard title="Pelanggan" value="850" icon={<Users size={20} />} trend="+12% bulan ini" color="violet" delay="delay-[300ms]" />
        <StatCard title="Pendapatan" value="Rp 4.5M" icon={<TrendingUp size={20} />} trend="Naik 5.4%" color="amber" delay="delay-[450ms]" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6 duration-700 fill-mode-both">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl ring-1 ring-slate-200 shadow-sm transition-all duration-300">
          <h3 className="font-bold text-slate-800 mb-4">Grafik Penjualan</h3>
          <div className="flex items-center justify-center h-64 text-slate-300 italic border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/50">
            Chart data loading...
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl ring-1 ring-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Produk Terlaris</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
                  <div className="h-2 w-16 bg-slate-50 rounded" />
                </div>
                <div className="text-sm font-bold text-blue-600">32x</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color, delay }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className={`bg-white p-6 rounded-2xl ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-blue-100 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${delay}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h2>
        <div className="flex items-center gap-1 mt-1 text-emerald-500">
          <TrendingUp size={12} />
          <p className="text-[11px] font-semibold">{trend}</p>
        </div>
      </div>
    </div>
  );
}