'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

  useEffect(() => {
    axios.get('/api/user/cart').then(res => setCart(res.data));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return alert('Keranjang kosong');
    const queryParams = cart.map(item => `product_id=${item.product_id}&quantity=${item.quantity}`).join('&');
    router.push(`/user/checkout?${queryParams}`);
  };

  const handleDelete = async (cart_id: number) => {
    if (!confirm('Hapus item ini dari keranjang?')) return;
    try {
      await axios.delete(`/api/user/cart/${cart_id}`);
      setCart(prev => prev.filter(item => item.cart_id !== cart_id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus item');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-4 rounded-md mb-6">
        <h1 className="text-2xl font-semibold">Keranjang Saya</h1>
        <p className="mt-1 text-blue-100">Cek produk yang ingin kamu beli</p>
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-center mt-6">Keranjang kosong</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.cart_id} className="flex flex-col md:flex-row items-center bg-white shadow rounded-md overflow-hidden">
              {/* Gambar */}
              {item.primary_image && (
                <img src={item.primary_image} alt={item.product_name} className="w-full md:w-32 h-32 object-cover" />
              )}

              {/* Info Produk */}
              <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between w-full">
                <div className="flex-1">
                  <h2
                    className="text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => router.push(`/user/cart/${item.product_id}?quantity=${item.quantity}`)}
                  >
                    {item.product_name}
                  </h2>
                  <p className="text-gray-700 mt-1">
                    Harga: Rp {item.price.toLocaleString()} x {item.quantity}
                  </p>
                  <p className="text-gray-800 font-semibold mt-1">
                    Subtotal: Rp {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Aksi */}
                <button
                  onClick={() => handleDelete(item.cart_id)}
                  className="mt-2 md:mt-0 md:ml-4 bg-red-600 text-white px-4 py-2 hover:bg-red-700 rounded"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total & Checkout */}
      {cart.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white shadow p-4 rounded-md">
          <h3 className="text-lg font-semibold">Total: Rp {total.toLocaleString()}</h3>
          <button
            onClick={handleCheckout}
            className="mt-2 md:mt-0 bg-blue-700 text-white px-6 py-2 hover:bg-blue-800 rounded"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
