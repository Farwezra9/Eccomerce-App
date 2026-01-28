'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  buyer: string;
  shop_name?: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Order[]>('/api/admin/orders', {
        params: { status: statusFilter, payment: paymentFilter },
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  if (loading) return <p>Memuat data pesanan...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🧾 Manajemen Pesanan (Shopee-style)</h1>

      {/* FILTER */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="">Semua Status Order</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="">Semua Status Pembayaran</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>

        <button
          onClick={loadOrders}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            {['ID', 'Pembeli', 'Toko', 'Total', 'Status Order', 'Status Pembayaran', 'Tanggal'].map(
              (col) => (
                <th key={col} style={thStyle}>
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td style={tdStyle}>{o.id}</td>
              <td style={tdStyle}>{o.buyer}</td>
              <td style={tdStyle}>{o.shop_name ?? '-'}</td>
              <td style={tdStyle}>Rp {Number(o.total).toLocaleString('id-ID')}</td>
              <td style={tdStyle}>{o.order_status}</td>
              <td style={tdStyle}>{o.payment_status}</td>
              <td style={tdStyle}>{new Date(o.created_at).toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ======================
   STYLE SAFE
   ====================== */
const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px',
  textAlign: 'left' as const, // <-- penting untuk type-safe
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px',
};
