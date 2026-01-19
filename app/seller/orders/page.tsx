'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);

 useEffect(() => {
  const loadOrders = async () => {
    try {
      const res = await axios.get('/api/seller/orders');
      setOrders(res.data);
    } catch {
      setOrders([]);
    }
  };

  loadOrders();
}, []);


  return (
    <>
      <h1>Pesanan Masuk</h1>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            Order #{o.id} - Rp{o.total} ({o.status})
          </li>
        ))}
      </ul>
    </>
  );
}
