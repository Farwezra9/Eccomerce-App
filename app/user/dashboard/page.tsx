'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Store } from 'lucide-react';

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
    axios
      .get('/api/user', { withCredentials: true })
      .then(res => setProducts(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-6 rounded-2xl">
  <h1 className="text-2xl font-semibold text-white">
    Semua Produk
  </h1>
  <p className="mt-1 text-sm text-blue-100">
    Temukan produk terbaik dari berbagai toko
  </p>
</div>


      {/* Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map(p => (
            <Link
              key={p.product_id}
              href={`/user/products/${p.product_id}`}
              className="block"
            >
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  {p.primary_image && (
                    <img
                      src={p.primary_image}
                      alt={p.product_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1 p-3">
                  <p className="line-clamp-2 text-sm font-medium text-gray-800">
                    {p.product_name}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Store className="h-3.5 w-3.5 text-blue-700" />
                    {p.shop_name}
                  </div>

                  <p className="pt-1 text-sm font-semibold text-blue-800">
                    Rp {p.price.toLocaleString('id-ID')}
                  </p>

                  <p className="text-xs text-gray-500">
                    Stok {p.stock}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
