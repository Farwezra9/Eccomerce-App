'use client';

import Link from 'next/link';
import { 
  Facebook, Instagram, Twitter, 
  HelpCircle, ShieldCheck, Truck, 
  Smartphone, MousePointer2 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Information Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Layanan Pelanggan */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-4">Layanan Pelanggan</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-indigo-600">Bantuan</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Metode Pembayaran</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Lacak Pesanan Pembeli</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Gratis Ongkir</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Garansi BelanjaAja</Link></li>
            </ul>
          </div>

          {/* Tentang Kami */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-4">Tentang BelanjaAja</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-indigo-600">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Karir</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Kontak Media</Link></li>
            </ul>
          </div>

          {/* Pembayaran & Pengiriman (Shopee Style Grid) */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-4">Pembayaran</h4>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-slate-100 shadow-sm p-1 rounded flex items-center justify-center">
                  <div className="h-4 w-8 bg-slate-100 rounded animate-pulse" /> {/* Placeholder untuk Logo Bank */}
                </div>
              ))}
            </div>
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-4">Pengiriman</h4>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-100 shadow-sm p-1 rounded flex items-center justify-center">
                  <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Ikuti Kami */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-4">Ikuti Kami</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Facebook size={16} className="text-slate-400" />
                <Link href="#" className="hover:text-indigo-600">Facebook</Link>
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={16} className="text-slate-400" />
                <Link href="#" className="hover:text-indigo-600">Instagram</Link>
              </li>
              <li className="flex items-center gap-2">
                <Twitter size={16} className="text-slate-400" />
                <Link href="#" className="hover:text-indigo-600">Twitter</Link>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-4">Download Aplikasi</h4>
            <div className="flex gap-3">
              <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center">
                  <span className="text-[10px] text-slate-400">QR Code</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Smartphone size={12} /> App Store
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                  <MousePointer2 size={12} /> Google Play
                </div>
              </div>
            </div>
          </div>

        </div>

        <hr className="border-slate-100" />

        {/* BOTTOM SECTION: Copyright & Legal */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© BelanjaAja {currentYear}. Hak Cipta Dilindungi</p>
          <div className="flex flex-wrap justify-center gap-4">
            <span>Negara: Indonesia | Taiwan | Thailand | Malaysia | Vietnam | Filipina</span>
          </div>
        </div>

      </div>
    </footer>
  );
}