'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ShoppingCart, Store, ChevronLeft, Plus, Minus, Zap } from 'lucide-react';

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

    axios.get(`/api/user/products/${id}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  
  if (!product) return <div className="text-center py-20 font-bold text-slate-400">Produk tidak ditemukan</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Tombol Kembali Ringkas */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 mb-4 transition-all">
        <ChevronLeft size={18} />
        <span className="text-sm font-bold">Kembali</span>
      </button>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Kolom Gambar - Ukuran diperkecil ke 40% */}
        <div className="w-full md:w-[40%]">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            {product.primary_image ? (
              <img src={product.primary_image} alt={product.product_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold">No Image</div>
            )}
          </div>
        </div>

        {/* Kolom Detail - Lebih padat */}
        <div className="flex-1 flex flex-col py-1">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-2xl uppercase tracking-wider">Original</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Store size={14} />
                <span className="text-xs font-bold">{product.shop_name}</span>
              </div>
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2">{product.product_name}</h1>
            <p className="text-2xl font-black text-emerald-700 mb-4 ">{formatPrice(product.price)}</p>
            
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
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600"><Minus size={16} /></button>
                <span className="w-8 text-center font-black text-sm text-slate-800">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600"><Plus size={16} /></button>
              </div>
            </div>

            <div className="hidden md:flex gap-3">
              <button onClick={() => axios.post('/api/user/cart', { product_id: product.product_id, quantity }).then(() => router.push('/user/cart'))} 
                className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                <ShoppingCart size={16} /> Keranjang
              </button>
              <button onClick={() => router.push(`/user/checkout?product_id=${product.product_id}&quantity=${quantity}`)} 
                className="flex-[1.5] bg-indigo-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                <Zap size={16} fill="currentColor" /> Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bar - Lebih Tipis */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-3 flex gap-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/user/cart')} className="w-14 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center"><ShoppingCart size={20} /></button>
        <button onClick={() => router.push(`/user/checkout?product_id=${product.product_id}&quantity=${quantity}`)} 
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
          <Zap size={18} fill="currentColor" /> Beli Sekarang
        </button>
      </div>
    </div>
  );
}