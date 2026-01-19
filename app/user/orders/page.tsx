'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  total: number;
  order_status: string;
  created_at: string;
  items: OrderItem[];
}

const statusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#ff9800';
    case 'paid': return '#2196f3';
    case 'shipped': return '#673ab7';
    case 'completed': return '#4caf50';
    case 'cancelled': return '#f44336';
    default: return '#999';
  }
};

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    axios.get('/api/user/orders').then(res => setOrders(res.data));
  }, []);

  if (orders.length === 0) return <p>Belum ada pesanan</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>Pesanan Saya</h1>

      {orders.map(order => (
        <div
          key={order.order_id}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 6,
            padding: 12,
            marginBottom: 16,
            background: '#fff'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order #{order.order_id}</span>
            <span
              style={{
                color: statusColor(order.order_status),
                fontWeight: 'bold'
              }}
            >
              {order.order_status.toUpperCase()}
            </span>
          </div>

          <hr />

          {/* Items */}
          {order.items.map(item => (
            <div key={item.id} style={{ marginBottom: 6 }}>
              <b>{item.product_name}</b> x {item.quantity}
            </div>
          ))}

          <hr />

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>Total: Rp {order.total.toLocaleString()}</b>
            <Link href={`/user/orders/${order.order_id}`}>
              Lihat Detail →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
