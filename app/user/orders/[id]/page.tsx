'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
}

interface OrderDetail {
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

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios.get(`/api/user/order/${id}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order tidak ditemukan</p>;

  return (
    <div>
      <h1>Detail Order #{order.order_id}</h1>
      <p>Status Order: {order.order_status}</p>
      <p>Total: Rp {order.total.toLocaleString()}</p>
      <p>Dipesan: {new Date(order.created_at).toLocaleString()}</p>

      <h2>Alamat Pengiriman</h2>
      <p>{order.recipient_name}</p>
      <p>{order.address}, {order.city}, {order.postal_code}</p>
      <p>HP: {order.recipient_phone}</p>

      <h2>Payment</h2>
      <p>Metode: {order.payment_method}</p>
      <p>Status: {order.payment_status}</p>

      <h2>Shipping</h2>
      <p>Kurir: {order.courier_name}</p>
      <p>Status: {order.shipping_status}</p>
      {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}

      <h2>Items</h2>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            {item.product_name} x {item.quantity} = Rp {(item.price * item.quantity).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
