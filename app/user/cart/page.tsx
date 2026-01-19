'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface CartItem {
  cart_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCart = async () => {
    try {
      const res = await axios.get('/api/user/cart');
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCart();
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
    <div>
      <h1>Keranjang Saya</h1>
      {cart.length === 0 ? (
        <p>Keranjang kosong</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Harga</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.cart_id}>
                <td
                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => router.push(`/user/cart/detail/${item.product_id}?quantity=${item.quantity}`)}
                >
                  {item.product_name}
                </td>
                <td>Rp {item.price.toLocaleString()}</td>
                <td>{item.quantity}</td>
                <td>Rp {(item.price * item.quantity).toLocaleString()}</td>
                <td>
                  <button
                    style={{ background: 'red', color: 'white', cursor: 'pointer', padding: '4px 8px' }}
                    onClick={() => handleDelete(item.cart_id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Total: Rp {total.toLocaleString()}</h3>
      <button onClick={handleCheckout} disabled={cart.length === 0}>
        Checkout
      </button>
    </div>
  );
}
