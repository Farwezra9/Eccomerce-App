'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/seller/orders')
      .then(res => setOrders(res.data));
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
