'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category_name?: string;
  status: string;
}

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    // Ambil produk seller
    axios.get('/api/seller/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    // Ambil info seller (nama toko)
    axios.get('/api/seller/profile')
      .then(res => setShopName(res.data.shop_name))
      .catch(err => console.error(err));
  }, []);

  // format harga
  const formatPrice = (price: number) => {
    return price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Produk Saya</h1>
      {shopName && <h3>🏪 {shopName}</h3>}

      <a href="/seller/products/create" style={{ display: 'inline-block', margin: '10px 0', textDecoration: 'none', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', borderRadius: 5 }}>
        ➕ Tambah Produk
      </a>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Nama</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Harga</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Stok</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Kategori</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.name}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{formatPrice(p.price)}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.stock}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.category_name || '-'}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
