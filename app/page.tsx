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
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Semua Produk
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <Link
            key={p.product_id}
            href={`/user/products/${p.product_id}`}
            className="group"
          >
            <div className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-lg">
              {p.primary_image && (
                <img
                  src={p.primary_image}
                  alt={p.product_name}
                  className="h-48 w-full object-cover transition group-hover:scale-105"
                />
              )}

              <div className="p-4">
                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                  {p.product_name}
                </h3>

                <p className="text-sm text-gray-500">
                  🏪 {p.shop_name}
                </p>

                <p className="mt-2 font-bold text-green-600">
                  💰 Rp {p.price.toLocaleString('id-ID')}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Stock: {p.stock}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
