'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string | null;
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
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'paid': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    axios.get('/api/user/orders').then(res => setOrders(res.data));
  }, []);

  if (orders.length === 0)
    return <p className="text-center mt-6 text-gray-500">Belum ada pesanan</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Pesanan Saya</h1>

      {orders.map(order => (
        <div key={order.order_id} className="bg-white shadow-md rounded-md">
          {/* Header gradient biru */}
          <div className="flex justify-end items-center p-4 rounded-t-md text-white font-semibold bg-gradient-to-r from-blue-900 to-blue-700">
            <span className={`px-2 py-1 rounded text-sm font-medium ${statusColor(order.order_status)}`}>
              {order.order_status.toUpperCase()}
            </span>
          </div>

          {/* Items */}
          <div className="divide-y">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center p-4 space-x-4">
                <img
                  src={item.product_image || '/placeholder.png'}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-gray-500 text-sm">Rp {item.price.toLocaleString()} x {item.quantity}</p>
                </div>
                <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t">
            <div>
              <p className="text-gray-500 text-sm">Total Bayar:</p>
              <p className="font-bold text-lg">Rp {order.total.toLocaleString()}</p>
            </div>
            <Link
              href={`/user/orders/${order.order_id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              Lihat Detail →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
