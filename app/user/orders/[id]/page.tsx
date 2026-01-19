// app/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface OrderItem { id: number; product_id: number; quantity: number; price: number; product_name: string; }
interface OrderDetail {
  order_id: number; total: number; order_status: string; created_at: string;
  recipient_name: string | null; recipient_phone: string | null;
  address: string | null; city: string | null; postal_code: string | null;
  payment_method: string | null; payment_status: string | null;
  courier_name: string | null; tracking_number: string | null;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/user/orders/${id}`).then(res => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  // Load Snap.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!order || !snapLoaded) return alert('Snap.js belum siap');
    setPayLoading(true);

    const res = await axios.post('/api/payment/midtrans', {
      order_id: order.order_id,
      gross_amount: order.total,
    });

    const snapToken = res.data.snapToken;

    // @ts-ignore
    window.snap.pay(snapToken, {
      onSuccess: async () => await refreshOrder('paid'),
      onPending: async (result: any) => {
        alert(`Pending! VA: ${result.va_numbers?.map((v: any) => v.va_number).join(', ')}`);
        await refreshOrder('pending');
      },
      onError: () => alert('Pembayaran gagal'),
      onClose: () => alert('Popup ditutup'),
    });

    setPayLoading(false);
  };

  const refreshOrder = async (status: string) => {
    const updated = await axios.get(`/api/user/orders/${id}`);
    setOrder(updated.data);
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order tidak ditemukan</p>;

  const canPay = order.order_status === 'pending' && order.payment_status === 'pending';

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h1>Order #{order.order_id}</h1>
      <p>Status: {order.payment_status || 'pending'}</p>
      <p>Total: Rp {order.total.toLocaleString()}</p>

      {canPay && (
        <button onClick={handlePayment} disabled={payLoading}>
          {payLoading ? 'Mengarahkan ke Midtrans...' : 'Bayar Sekarang'}
        </button>
      )}

      <h2>Items</h2>
      <ul>{order.items.map(item => (
        <li key={item.id}>{item.product_name} x {item.quantity} = Rp {(item.price*item.quantity).toLocaleString()}</li>
      ))}</ul>
    </div>
  );
}
