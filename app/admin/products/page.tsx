'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  status: 'active' | 'inactive';
  shop_name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await axios.get<Product[]>('/api/admin/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (
    productId: number,
    currentStatus: 'active' | 'inactive'
  ) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';

    const confirmText =
      nextStatus === 'inactive'
        ? 'Nonaktifkan produk ini?'
        : 'Aktifkan kembali produk ini?';

    if (!confirm(confirmText)) return;

    await axios.post('/api/admin/products', {
      product_id: productId,
      status: nextStatus
    });

    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) return <p>Memuat produk...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Manajemen Produk</h1>

      {products.length === 0 && <p>Tidak ada produk.</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={thStyle}>Nama</th>
            <th style={thStyle}>Toko</th>
            <th style={thStyle}>Harga</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>{p.shop_name}</td>
              <td style={tdStyle}>
                Rp {Number(p.price).toLocaleString('id-ID')}
              </td>
              <td style={tdStyle}>
                {p.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </td>
              <td style={tdStyle}>
                <button
                  style={{
                    background: p.status === 'active' ? '#e74c3c' : '#2ecc71',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    borderRadius: 4
                  }}
                  onClick={() => toggleStatus(p.id, p.status)}
                >
                  {p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ======================
   STYLE (TS SAFE)
   ====================== */

const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px'
};
