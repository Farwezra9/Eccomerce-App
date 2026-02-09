'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ShoppingCart, Store, AlertCircle, Plus, Minus, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const qty = searchParams.get('quantity');
    if (qty) setQuantity(Number(qty));

    // Fetch data langsung tanpa pembungkus extra
    setLoading(true);
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  // Fungsi helper sederhana untuk harga
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price || 0);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 font-bold text-slate-500">
      <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
      Produk tidak ditemukan
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1 text-[11px] md:text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
       <Link href="/" className="hover:text-indigo-600 font-bold shrink-0 transition-colors">BelanjaAja</Link>
        <ChevronRight size={12} className="text-slate-300 shrink-0" />
        
        {product.breadcrumbs?.map((cat: any) => (
          <div key={cat.id} className="flex items-center gap-1 shrink-0">
            <Link href={`/category/${cat.id}`} className="hover:text-indigo-600 font-bold transition-colors">
              {cat.name}
            </Link>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
          </div>
        ))}
        
        <span className="text-slate-500 truncate max-w-[200px] md:max-w-xs tracking-tight">
          {product.product_name}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Kolom Gambar */}
        <div className="w-full md:w-[40%]">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
            {product.primary_image ? (
              <img 
                src={product.primary_image} 
                alt={product.product_name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">No Image</div>
            )}
          </div>
        </div>

        {/* Kolom Detail */}
        <div className="flex-1 flex flex-col py-1">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-2xl uppercase tracking-wider">Original</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Store size={14} />
                <span className="text-xs font-bold">{product.shop_name}</span>
              </div>
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
              {product.product_name}
            </h1>
            <p className="text-2xl font-black text-emerald-700 mb-4 tracking-tighter">
              {formatPrice(product.price)}
            </p>
            
            <div className="h-px bg-slate-100 w-full mb-4" />
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi</h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-4 md:line-clamp-none">
              {product.description || "Minimalist product description."}
            </p>
          </div>

          {/* Selector & Action */}
          <div className="mt-auto pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Jumlah</span>
              <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 active:scale-90"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-black text-sm text-slate-800">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} 
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 active:scale-90"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => axios.post('/api/user/cart', { product_id: product.id, quantity }).then(() => router.push('/user/cart'))} 
                className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-[0.98]"
              >
                <ShoppingCart size={16} /> Keranjang
              </button>
              <button 
                onClick={() => router.push(`/user/checkout?product_id=${product.id}&quantity=${quantity}`)} 
                className="flex-[1.5] bg-indigo-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                <Zap size={16} fill="currentColor" /> Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-3 flex gap-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/user/cart')} className="w-14 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center active:bg-slate-100 transition-colors">
          <ShoppingCart size={20} />
        </button>
        <button 
          onClick={() => router.push(`/user/checkout?product_id=${product.id}&quantity=${quantity}`)} 
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
        >
          <Zap size={18} fill="currentColor" /> Beli Sekarang
        </button>
      </div>
    </div>
  );
}