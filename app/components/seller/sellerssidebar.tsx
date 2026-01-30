'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ClipboardList, Settings, 
  Store, BarChart3, ArrowLeftRight, ChevronRight, UserCircle 
} from 'lucide-react';

export default function SellerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Produk Saya', href: '/seller/products', icon: Package },
    { name: 'Pesanan', href: '/seller/orders', icon: ClipboardList },
    { name: 'Statistik', href: '/seller/analytics', icon: BarChart3 },
    { name: 'Transaksi', href: '/seller/transactions', icon: ArrowLeftRight },
    { name: 'Pengaturan Toko', href: '/seller/settings', icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-950 border-r border-white/10 flex flex-col z-40 shadow-2xl">
      
      {/* Header Sidebar: Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/seller/dashboard" className="flex items-center gap-3 group">
          <div className="bg-white/10 p-2 rounded-xl shadow-inner border border-white/10 transition-transform group-hover:scale-110">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight text-lg">Seller Panel</h1>
            <p className="text-[10px] text-blue-200 font-medium uppercase tracking-widest">Premium Store</p>
          </div>
        </Link>
      </div>

      {/* Body Sidebar: Menu Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => {
          const Active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                Active 
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg border border-white/20' 
                  : 'text-blue-100/60 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={19} className={Active ? 'text-white' : 'group-hover:text-white transition-colors'} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              {Active && <ChevronRight size={14} className="text-white animate-in slide-in-from-left-2" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar: Dashboard User */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-black/10">
        <Link 
          href="/user/dashboard" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 border border-white/10 transition-all shadow-md group"
        >
          <UserCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Dashboard User</span>
        </Link>

        {/* Version Info */}
        <div className="px-4 py-2 bg-white/5 rounded-lg border border-transparent">
          <p className="text-[9px] text-blue-300/40 font-bold uppercase tracking-widest">Version 1.0.4</p>
        </div>
      </div>
    </aside>
  );
}