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
  product_image: string | null;
}

interface OrderDetail {
  order_id: number;
  total: number;
  order_status: string;
  created_at: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  payment_method: string | null;
  payment_status: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/user/orders/${id}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  // Load Midtrans Snap.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);
  }, []);

  const cancelOrder = async () => {
    if (!confirm('Yakin ingin membatalkan order ini?')) return;
    setCancelLoading(true);
    await axios.post(`/api/user/orders/${id}/cancel`);
    const res = await axios.get(`/api/user/orders/${id}`);
    setOrder(res.data);
    setCancelLoading(false);
  };

  const handlePayment = async () => {
    if (!order || !snapLoaded) return alert('Tunggu sebentar, Snap.js belum siap');
    setPayLoading(true);

    const res = await axios.post('/api/payment/midtrans', { order_id: order.order_id });
    const snapToken = res.data.snapToken;

    // @ts-ignore
    window.snap.pay(snapToken, {
      onSuccess: async () => {
        alert('Pembayaran berhasil!');
        const updated = await axios.get(`/api/user/orders/${id}`);
        setOrder(updated.data);
      },
      onPending: async () => {
        alert('Pembayaran pending...');
        const updated = await axios.get(`/api/user/orders/${id}`);
        setOrder(updated.data);
      },
      onError: () => alert('Pembayaran gagal'),
      onClose: () => alert('Popup pembayaran ditutup'),
    });

    setPayLoading(false);
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!order) return <p className="text-center mt-6">Order tidak ditemukan</p>;

  const canCancel = order.order_status === 'pending' && order.payment_status === 'pending';
  const canPay = canCancel;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 rounded-md text-white flex justify-between items-center">
        <span className="font-semibold">Status {order.order_status}</span>
        <span>{new Date(order.created_at).toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {canCancel && (
          <button
            onClick={cancelOrder}
            disabled={cancelLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            {cancelLoading ? 'Membatalkan...' : 'Batalkan Order'}
          </button>
        )}
        {canPay && (
          <button
            onClick={handlePayment}
            disabled={payLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {payLoading ? 'Mengarahkan ke Midtrans...' : 'Bayar Sekarang'}
          </button>
        )}
      </div>

      {/* Shipping Info */}
      <div className="bg-white shadow-md rounded-md p-4 space-y-2">
        <h2 className="font-semibold mb-2">Alamat Pengiriman</h2>
        <p>Nama: {order.recipient_name || '-'}</p>
        <p>Alamat: {order.address ? `${order.address}, ${order.city}, ${order.postal_code}` : '-'}</p>
        <p>HP: {order.recipient_phone || '-'}</p>
      </div>

      {/* Payment Info */}
      <div className="bg-white shadow-md rounded-md p-4 space-y-2">
        <h2 className="font-semibold mb-2">Pembayaran</h2>
        <p>Metode: {order.payment_method || 'Belum dipilih'}</p>
        <p>Status: {order.payment_status || 'pending'}</p>
        {order.courier_name && <p>Kurir: {order.courier_name}</p>}
        {order.tracking_number && <p>No. Resi: {order.tracking_number}</p>}
      </div>

      {/* Items */}
      <div className="bg-white shadow-md rounded-md p-4 space-y-4">
        <h2 className="font-semibold mb-2">Items</h2>
        {order.items.map(item => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-2 last:border-b-0">
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
        <div className="text-right font-bold text-lg mt-2">Total: Rp {order.total.toLocaleString()}</div>
      </div>
    </div>
  );
}
