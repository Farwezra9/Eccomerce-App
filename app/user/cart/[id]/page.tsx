'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ShoppingCart, Store, Package, ChevronLeft, Minus, Plus } from 'lucide-react';

interface ProductDetail {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  stock: number;
  shop_name: string;
  seller_id: number;
  primary_image: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const qty = searchParams.get('quantity');
    if (qty) setQuantity(Number(qty));

    axios.get(`/api/user/products/${id}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="font-bold text-slate-500">Produk tidak ditemukan</p>
    </div>
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const orderNow = () => {
    router.push(`/user/checkout?product_id=${product.product_id}&quantity=${quantity}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        {/* Kolom Kiri: Gambar */}
        <div className="relative aspect-square bg-slate-50 rounded-[2rem] overflow-hidden group">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.product_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package size={64} />
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">Habis</span>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Detail & Aksi */}
        <div className="flex flex-col">
          <div className="flex-1">
            {/* Nama Toko */}
            <div className="flex items-center gap-2 text-indigo-600 mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Store size={18} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">{product.shop_name}</span>
            </div>

            {/* Nama Produk */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight mb-4">
              {product.product_name}
            </h1>

            {/* Harga */}
            <p className="text-3xl font-black text-indigo-600 italic mb-6">
              {formatPrice(product.price)}
            </p>

            <div className="h-px bg-slate-100 w-full mb-6" />

            {/* Deskripsi */}
            <div className="mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Deskripsi Produk</h3>
              <p className="text-slate-600 leading-relaxed font-medium italic">
                {product.description}
              </p>
            </div>

            {/* Stok & Atur Jumlah */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Atur Jumlah</h3>
                <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>
                  Stok: {product.stock}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity === 1 || product.stock === 0}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="w-12 text-center font-black text-slate-800">{quantity}</div>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity === product.stock || product.stock === 0}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase italic">
                   Total: <span className="text-slate-800 not-italic">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={orderNow}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <ShoppingCart className="h-5 w-5 group-hover:animate-bounce" />
            Pesan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}