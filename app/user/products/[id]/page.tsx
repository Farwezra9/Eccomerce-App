'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';

interface ProductDetail {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  stock: number;
  shop_name: string;
  seller_id: number;
  primary_image: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const qty = searchParams.get('quantity');
    if (qty) setQuantity(Number(qty));

    axios.get(`/api/user/products/${id}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  if (loading) return <p className="text-gray-600 text-center mt-6">Loading...</p>;
  if (!product) return <p className="text-red-600 text-center mt-6">Produk tidak ditemukan</p>;

  const addToCart = async () => {
    try {
      await axios.post('/api/user/cart', { product_id: product.product_id, quantity });
      alert('Berhasil ditambahkan ke keranjang');
      router.push(`/user/cart`);
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan ke keranjang');
    }
  };

  const orderNow = () => {
    router.push(`/user/checkout?product_id=${product.product_id}&quantity=${quantity}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-4 rounded-md mb-6">
        <h1 className="text-2xl font-semibold">{product.product_name}</h1>
        <p className="mt-1 text-blue-100">🏪 {product.shop_name}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        {product.primary_image && (
          <img
            src={product.primary_image}
            alt={product.product_name}
            className="w-full md:w-1/3 h-80 object-cover rounded-md shadow-md"
          />
        )}

        {/* Detail */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-xl font-bold text-blue-900 mb-2">💰 Rp {product.price.toLocaleString()}</p>
            <p className={`mb-4 ${product.stock === 0 ? 'text-red-600' : 'text-gray-700'}`}>
              Stock: {product.stock}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity === 1}
                className="w-10 h-10 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                −
              </button>
              <div className="w-14 h-10 border border-gray-300 flex items-center justify-center rounded">{quantity}</div>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity === product.stock}
                className="w-10 h-10 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              Masukkan Keranjang
            </button>

            <button
              onClick={orderNow}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
