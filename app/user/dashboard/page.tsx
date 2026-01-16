'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  stock: number;
  shop_name: string;
  primary_image: string | null;
}

export default function UserDashboard() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get('/api/user').then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h1>Semua Produk</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {products.map(p => (
          <Link key={p.product_id} href={`/user/products/${p.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ccc', padding: 10, cursor: 'pointer' }}>
              {p.primary_image && <img src={p.primary_image} alt={p.product_name} width={200} />}
              <h3>{p.product_name}</h3>
              <p>🏪 {p.shop_name}</p>
              <p>💰 Rp {p.price}</p>
              <p>Stock: {p.stock}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
