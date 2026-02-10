'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Star, MapPin, LayoutGrid, Smartphone, Shirt, Home, Laptop, Utensils } from 'lucide-react';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  stock: number;
  shop_name: string;
  shop_city?: string;
  rating?: number;
  sold_count?: number;
  primary_image: string | null;
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Semua', icon: <LayoutGrid size={18} /> },
    { name: 'Elektronik', icon: <Smartphone size={18} /> },
    { name: 'Fashion', icon: <Shirt size={18} /> },
    { name: 'Rumah', icon: <Home size={18} /> },
    { name: 'Laptop', icon: <Laptop size={18} /> },
    { name: 'Kuliner', icon: <Utensils size={18} /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // MENGARAH KE API PUBLIK
        const res = await axios.get('/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Gagal memuat produk publik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-700 px-8 py-10 rounded-t-lg">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              BelanjaAja
            </h1>
            <p className="mt-2 text-indigo-100 max-w-md font-medium">
              Temukan produk terbaik dari penjual terpercaya di seluruh Indonesia.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Category Bar */}
        <div className="bg-white border-x border-b border-slate-200 rounded-b-lg mb-8 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-3">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all whitespace-nowrap text-sm font-bold tracking-tight uppercase ${
                  idx === 0 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="pb-20">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded border border-slate-100 h-80 animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
              {products.map(p => (
                <Link
                  key={p.product_id}
                  // Karena ini Landing Page Publik, arahkan ke detail publik atau login
                  href={`/products/${p.product_id}`}
                  className="group"
                >
                  <div className="h-full flex flex-col overflow-hidden rounded border border-slate-200 bg-white transition-all duration-300 hover:shadow-md hover:border-indigo-300">
                    
                    {/* Image Section */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {p.primary_image ? (
                        <img
                          src={p.primary_image}
                          alt={p.product_name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300 text-xs italic">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Info Container */}
                    <div className="p-3 flex flex-col flex-grow">
                      <h2 className="line-clamp-2 text-sm font-medium text-slate-700 leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                        {p.product_name}
                      </h2>

                      <p className="text-base font-bold text-slate-900 mb-2">
                        {formatPrice(p.price)}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-600 font-medium">
                            {p.rating || '0'}
                          </span>
                        </div>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-xs text-slate-500">
                          Terjual {p.sold_count || '0'}
                        </span>
                      </div>

                      <div className="mt-auto pt-2 flex items-center gap-1 text-slate-400 border-t border-slate-50">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="text-[11px] font-medium truncate uppercase tracking-tight">
                          {p.shop_city || 'Indonesia'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white inline-block p-10 rounded-lg shadow-sm border border-slate-200">
                 <p className="text-slate-500 font-medium">Belum ada produk yang tersedia saat ini.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}