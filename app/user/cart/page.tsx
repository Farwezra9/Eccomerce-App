'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Trash2, ShoppingCart, ArrowRight, ChevronLeft } from 'lucide-react';

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
    axios.get('/api/user/cart')
      .then(res => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const queryParams = cart.map(item => `product_id=${item.product_id}&quantity=${item.quantity}`).join('&');
    router.push(`/user/checkout?${queryParams}`);
  };

  const handleDelete = async (e: React.MouseEvent, cart_id: number) => {
    e.stopPropagation(); // Agar klik hapus tidak memicu navigasi ke detail produk
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
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.push('/user/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Kembali Belanja
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-700 text-white p-8 rounded-2xl shadow-xl mb-10 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ShoppingCart size={32} />
            Keranjang Saya
          </h1>
          <p className="mt-2 text-indigo-100 font-medium opacity-90">
            Kamu memiliki {cart.length} item di keranjang belanja.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-lg">Keranjangmu masih kosong</p>
          <button 
            onClick={() => router.push('/user/dashboard')}
            className="mt-4 text-indigo-600 font-bold hover:underline"
          >
            Mulai Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* List Item */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              /* CARD UTAMA SEBAGAI SATU TOMBOL KLIK */
              <div 
                key={item.cart_id} 
                onClick={() => router.push(`/user/cart/${item.product_id}?quantity=${item.quantity}`)}
                className="group flex items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Gambar */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                  <img 
                    src={item.primary_image || '/placeholder.png'} 
                    alt={item.product_name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="ml-5 flex-1 min-w-0">
                  {/* Nama barang disamakan warnanya dengan teks utama */}
                  <h2 className="text-slate-800 font-bold truncate text-lg">
                    {item.product_name}
                  </h2>
                  <p className="text-emerald-700 font-black mt-1">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-sm font-bold text-slate-400">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-slate-800 tracking-tight">
                      Sub total : {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>

                {/* Tombol Hapus (Terproteksi stopPropagation) */}
                <button
                  onClick={(e) => handleDelete(e, item.cart_id)}
                  className="ml-4 p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ))}
          </div>

          {/* Ringkasan & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8">
              <h2 className="text-xl font-black text-slate-800 mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Total Produk</span>
                  <span className="text-slate-800 font-bold">{cart.length}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-800">Total Harga</span>
                  <span className="text-2xl font-black text-emerald-700 tracking-tighter">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Checkout
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}