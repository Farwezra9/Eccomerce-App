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

  useEffect(() => {
    if (!id) return;

    axios
      .get(`/api/user/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!confirm('Yakin ingin membatalkan order ini?')) return;

    try {
      setCancelLoading(true);
      await axios.post(`/api/user/orders/${id}/cancel`);
      const res = await axios.get(`/api/user/orders/${id}`);
      setOrder(res.data);
      alert('Order berhasil dibatalkan');
    } catch {
      alert('Gagal membatalkan order');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order tidak ditemukan</p>;

  const canCancel =
    order.order_status === 'pending' &&
    order.payment_status === 'pending';

  return (
    <div>
      <h1>Detail Order #{order.order_id}</h1>

      <p>Status Order: <b>{order.order_status}</b></p>
      <p>Total: Rp {order.total.toLocaleString()}</p>
      <p>Dipesan: {new Date(order.created_at).toLocaleString()}</p>

      {canCancel && (
        <button
          onClick={cancelOrder}
          disabled={cancelLoading}
          style={{ background: 'red', color: 'white', padding: 8, marginTop: 12 }}
        >
          {cancelLoading ? 'Membatalkan...' : 'Batalkan Order'}
        </button>
      )}

      <hr />

      {/* ================== ALAMAT ================== */}
      <h2>Alamat Pengiriman</h2>
      <p>Nama: {order.recipient_name || '-'}</p>
      <p>
        Alamat:{' '}
        {order.address
          ? `${order.address}, ${order.city}, ${order.postal_code}`
          : '-'}
      </p>
      <p>HP: {order.recipient_phone || '-'}</p>

      <hr />

      {/* ================== PAYMENT ================== */}
      <h2>Payment</h2>
      <p>Metode: {order.payment_method || 'Belum dipilih'}</p>
      <p>Status: {order.payment_status || 'pending'}</p>

      <hr />

      {/* ================== SHIPPING ================== */}
      <h2>Shipping</h2>
      <p>Kurir: {order.courier_name || 'Belum diproses'}</p>
      <p>
        No Resi:{' '}
        {order.tracking_number
          ? order.tracking_number
          : 'Menunggu pengiriman'}
      </p>

      <hr />

      {/* ================== ITEMS ================== */}
      <h2>Items</h2>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            {item.product_name} x {item.quantity} = Rp{' '}
            {(item.price * item.quantity).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
