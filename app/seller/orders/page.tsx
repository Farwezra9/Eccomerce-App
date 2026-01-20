'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [resi, setResi] = useState<Record<number, string>>({});

  const loadOrders = async () => {
    const res = await axios.get('/api/seller/orders');
    setOrders(res.data);
  };

  const updateStatus = async (orderId: number, status: string) => {
    await axios.post('/api/seller/orders', {
      order_id: orderId,
      status,
      tracking_number: resi[orderId]
    });

    setResi(prev => ({ ...prev, [orderId]: '' }));
    loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Pesanan Masuk</h1>

      {orders.map(order => (
        <div
          key={order.id}
          style={{ border: '1px solid #ddd', padding: 15, marginBottom: 10 }}
        >
          <p><b>Order #{order.id}</b></p>
          <p>Pembeli: {order.buyer_name}</p>
          <p>Total: Rp{order.total}</p>
          <p>Status: {order.status}</p>

          {order.tracking_number && (
            <p><b>Resi:</b> {order.tracking_number}</p>
          )}

          {order.status === 'processing' && (
            <button onClick={() => updateStatus(order.id, 'packed')}>
              📦 Siapkan Pesanan
            </button>
          )}

          {order.status === 'packed' && (
            <>
              <input
                placeholder="Nomor Resi"
                value={resi[order.id] || ''}
                onChange={e =>
                  setResi(prev => ({ ...prev, [order.id]: e.target.value }))
                }
              />
              <button onClick={() => updateStatus(order.id, 'shipped')}>
                🚚 Kirim Pesanan
              </button>
            </>
          )}

          {order.status === 'shipped' && (
            <span style={{ color: 'green' }}>✅ Sudah dikirim</span>
          )}
        </div>
      ))}
    </div>
  );
}
