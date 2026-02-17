'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Trash2, ShoppingCart, ArrowRight, ChevronRight, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  cart_id: number;
  product_id: number;
  product_name: string;
  primary_image?: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    axios.get('/api/user/cart')
      .then(res => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQty = async (e: React.MouseEvent, cart_id: number, newQty: number) => {
    e.stopPropagation();
    if (newQty < 1) return;

    try {
      setCart(prev => prev.map(item => 
        item.cart_id === cart_id ? { ...item, quantity: newQty } : item
      ));
      await axios.put(`/api/user/cart/${cart_id}`, { quantity: newQty });
    } catch (err) {
      alert('Gagal update jumlah');
      fetchCart();
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const queryParams = cart.map(item => `product_id=${item.product_id}&quantity=${item.quantity}`).join('&');
    router.push(`/user/checkout?${queryParams}`);
  };

  const handleDelete = async (e: React.MouseEvent, cart_id: number) => {
    e.stopPropagation();
    if (!confirm('Hapus item ini dari keranjang?')) return;
    try {
      await axios.delete(`/api/user/cart/${cart_id}`);
      setCart(prev => prev.filter(item => item.cart_id !== cart_id));
    } catch (err) {
      alert('Gagal menghapus item');
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex items-center gap-1 text-[11px] md:text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <Link href="/" className="hover:text-indigo-600 font-bold shrink-0 transition-colors">BelanjaAja</Link>
          <ChevronRight size={12} className="text-slate-300 shrink-0" />
          <span className="text-slate-500 truncate max-w-[200px] md:max-w-xs tracking-tight">
            Keranjang Saya
          </span>
        </nav>

        <div className="bg-indigo-600 text-white px-3 py-1.5 rounded shadow-sm shrink-0 mb-2">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            Keranjang<span className="bg-white/20 px-1.5 rounded">{cart.length}</span>
          </span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-lg">Keranjangmu masih kosong</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-indigo-600 font-bold hover:underline"
          >
            Mulai Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            {cart.map(item => (
              <div 
                key={item.cart_id} 
                onClick={() => router.push(`/cart/${item.product_id}?quantity=${item.quantity}`)}
                /* Menggunakan Grid pada Desktop (3 kolom), dan Flex pada Mobile */
                className="group flex flex-col md:grid md:grid-cols-3 md:items-center bg-white p-4 rounded border border-slate-100 shadow-sm hover:border-indigo-100 transition-all cursor-pointer active:scale-[0.99] gap-4"
              >
                {/* 1. Kiri: Image & Info Produk */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                    <img 
                      src={item.primary_image || '/placeholder.png'} 
                      alt={item.product_name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-slate-800 truncate text-sm font-medium">
                      {item.product_name}
                    </h2>
                    <p className="text-emerald-700 mt-0.5 text-sm">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                {/* Container Baris Bawah (Mobile) / Kolom Tengah & Kanan (Desktop) */}
                <div className="flex items-end justify-between md:contents">
                  
                  {/* 2. Tengah: Quantity Selector */}
                  <div className="flex flex-col items-start md:items-center">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-tighter md:hidden">Jumlah</p>
                    <div className="flex items-center bg-slate-50 rounded p-1 border border-slate-200" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => updateQty(e, item.cart_id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white rounded-md transition-all text-slate-600 hover:shadow-sm"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-black text-slate-800 min-w-[1.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={(e) => updateQty(e, item.cart_id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-md transition-all text-slate-600 hover:shadow-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="hidden md:block text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Jumlah</p>
                  </div>

                  {/* 3. Kanan: Subtotal & Delete */}
                  <div className="flex items-center gap-4 md:gap-8 justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Subtotal</p>
                      <p className="text-sm font-black text-emerald-700 tracking-tight">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(e, item.cart_id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Ringkasan & Checkout */}
          <div className="sticky bottom-6 z-30">
            <div className="bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Ringkasan Pesanan</h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm text-slate-800">Total Harga :</span>
                    <span className="text-sm font-black text-emerald-700 tracking-tighter">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full md:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-all shadow-md text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 group"
                >
                  Checkout
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center md:text-left tracking-wider">
                {cart.length} Produk terpilih dalam keranjang
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}