'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/user/cart').then(res => setCart(res.data));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1>Keranjang Saya</h1>
      {cart.length === 0 ? <p>Keranjang kosong</p> : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Harga</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.cart_id}>
                <td>{item.product_name}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Total: Rp {total.toLocaleString()}</h3>
      <button>Checkout</button>
    </div>
  );
}
