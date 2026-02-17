'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/categories?onlyParents=true')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      checkScroll();
      currentRef.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      currentRef?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories, checkScroll]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-700 px-8 py-10 rounded-t-lg">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">BelanjaAja</h1>
            <p className="mt-2 text-indigo-100 max-w-md font-medium">
              Temukan produk terbaik dari penjual terpercaya di seluruh Indonesia.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative bg-white border-x border-b border-slate-200 rounded-b-lg mb-8 shadow-sm group">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Kategori</h2>
          </div>
          
          <button 
            onClick={() => scroll('left')}
            className={`absolute left-0 top-[55%] -translate-y-1/2 -translate-x-1/2 z-30 bg-white shadow-xl rounded-full p-2.5 transition-all duration-300 border border-slate-200 hidden lg:block hover:scale-125 active:scale-95 ${
              canScrollLeft ? 'opacity-0 group-hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft size={22} className="text-slate-700" />
          </button>

          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="overflow-x-auto lg:overflow-hidden no-scrollbar scroll-smooth"
          >
            <div className="grid grid-rows-2 grid-flow-col auto-cols-[25%] sm:auto-cols-[20%] md:auto-cols-[14.28%] lg:auto-cols-[10%]">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="flex flex-col items-center justify-start p-3 sm:p-4 border-r border-b border-slate-50 hover:shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)] hover:z-10 transition-all group/item h-[130px] sm:h-[150px]"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 flex items-center justify-center bg-slate-50 rounded-full group-hover/item:scale-105 transition-transform duration-200">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded-md opacity-60"></div>
                  </div>
                  <span className="text-[11px] sm:text-[13px] text-slate-600 font-medium text-center line-clamp-2 leading-tight px-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <button 
            onClick={() => scroll('right')}
            className={`absolute right-0 top-[55%] -translate-y-1/2 translate-x-1/2 z-30 bg-white shadow-xl rounded-full p-2.5 transition-all duration-300 border border-slate-200 hidden lg:block hover:scale-125 active:scale-95 ${
              canScrollRight ? 'opacity-0 group-hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight size={22} className="text-slate-700" />
          </button>
        </div>

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
                <Link key={p.product_id} href={`/products/${p.product_id}`} className="group">
                  <div className="h-full flex flex-col overflow-hidden rounded border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm hover:border-indigo-300">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {p.primary_image ? (
                        <img src={p.primary_image} alt={p.product_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300 text-xs italic">No Image</div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <h2 className="line-clamp-2 text-sm font-medium text-slate-700 leading-snug mb-1 group-hover:text-indigo-600 transition-colors">{p.product_name}</h2>
                      <p className="text-base font-bold text-slate-900 mb-2">{formatPrice(p.price)}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-600 font-medium">{p.rating || '0'}</span>
                        </div>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-xs text-slate-500">Terjual {p.sold_count || '0'}</span>
                      </div>
                      <div className="mt-auto pt-2 flex items-center gap-1 text-slate-400 border-t border-slate-50">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="text-[11px] font-medium truncate uppercase tracking-tight">{p.shop_city || 'Indonesia'}</span>
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