'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

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
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    axios
      .get(`/api/user/products/${id}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Produk tidak ditemukan</p>;

  const addToCart = async () => {
    try {
      await axios.post('/api/user/cart/add', {
        product_id: product.product_id,
        quantity
      });
      alert('Berhasil ditambahkan ke keranjang');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan ke keranjang');
    }
  };
  // Langsung ke checkout multi-step
  const orderNow = () => {
    router.push(`/user/checkout?product_id=${product.product_id}&quantity=${quantity}`);
  };

  return (
    <div>
      <h1>{product.product_id}</h1>

      {product.primary_image && (
        <img
          src={product.primary_image}
          alt={product.product_name}
          width={300}
        />
      )}

      <p>🏪 {product.shop_name}</p>
      <p>{product.description}</p>
      <p>💰 Rp {product.price.toLocaleString()}</p>
      <p>Stock: {product.stock}</p>

      {/* ===== Quantity Shopee Style ===== */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          disabled={quantity === 1}
          style={{ width: 36, height: 36 }}
        >
          −
        </button>

        <div
          style={{
            width: 50,
            height: 36,
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {quantity}
        </div>

        <button
          onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
          disabled={quantity === product.stock}
          style={{ width: 36, height: 36 }}
        >
          +
        </button>
      </div>

      {/* ===== Action Buttons ===== */}
      <button
        onClick={addToCart}
        disabled={product.stock === 0}
      >
        Masukkan Keranjang
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={orderNow}
        disabled={product.stock === 0}
      >
        Pesan Sekarang
      </button>
    </div>
  );
}
