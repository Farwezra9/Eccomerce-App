'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
}

interface Order {
  order_id: number;
  total: number;
  order_status: string;
  created_at: string;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  city: string;
  postal_code: string;
  payment_method: string;
  payment_status: string;
  courier_name: string;
  shipping_status: string;
  tracking_number: string;
  items: OrderItem[];
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/user/order')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>Belum ada order</p>;

  return (
    <div>
      <h1>Riwayat Order</h1>
      {orders.map(order => (
        <div key={order.order_id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <h2>Order #{order.order_id}</h2>
          <p>Status Order: {order.order_status}</p>
          <p>Total: Rp {order.total.toLocaleString()}</p>
          <p>Dipesan: {new Date(order.created_at).toLocaleString()}</p>
          <p>Alamat: {order.recipient_name}, {order.address}, {order.city}, {order.postal_code} ({order.recipient_phone})</p>
          <p>Payment: {order.payment_method} - {order.payment_status}</p>
          <p>Shipping: {order.courier_name} - {order.shipping_status} {order.tracking_number && `(Tracking: ${order.tracking_number})`}</p>
          <h3>Items:</h3>
          <ul>
            {order.items.map(item => (
              <li key={item.id}>
                {item.product_name} x {item.quantity} = Rp {(item.price * item.quantity).toLocaleString()}
              </li>
            ))}
          </ul>
          <Link href={`/user/orders/${order.order_id}`}>Detail Order</Link>
        </div>
      ))}
    </div>
  );
}
