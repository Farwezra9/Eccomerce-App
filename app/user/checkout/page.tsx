'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/* =======================
   Interfaces
======================= */
interface ProductDetail {
  product_id: number;
  product_name: string;
  price: number;
  stock: number;
  shop_name: string;
}

interface Address {
  id: number;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
}

/* =======================
   Constants
======================= */
const SHIPPING_COST: Record<string, number> = {
  jne: 10000,
  sicepat: 9000,
  pos: 8000,
};

/* =======================
   Page
======================= */
export default function CheckoutPage() {
  const router = useRouter();

  const [productId, setProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<Address>({
    id: 0,
    recipient_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });

  const [courier, setCourier] = useState('jne');
  const [paymentMethod, setPaymentMethod] = useState('');

  /* =======================
     Get query params
  ======================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProductId(params.get('product_id'));
    setQuantity(Number(params.get('quantity') || 1));
  }, []);

  /* =======================
     Fetch product
  ======================= */
  useEffect(() => {
    if (!productId) return;
    axios.get(`/api/user/products/${productId}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [productId]);

  /* =======================
     Fetch addresses
  ======================= */
  useEffect(() => {
    axios.get('/api/user/addresses').then(res => {
      setAddresses(res.data);
      if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
    });
  }, []);

  if (loading) return <p className="text-center mt-6 text-gray-600">Loading...</p>;
  if (!product) return <p className="text-center mt-6 text-red-600">Produk tidak ditemukan</p>;

  const subtotal = product.price * quantity;
  const shippingCost = SHIPPING_COST[courier];
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    try {
      const shipping = selectedAddressId ? { id: selectedAddressId } : newAddress;
      const res = await axios.post('/api/user/checkout', {
        product_id: product.product_id,
        quantity,
        shipping,
        courier,
        payment_method: paymentMethod,
      });
      router.push(`/user/orders/${res.data.order_id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout gagal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* Product Summary */}
      <div className="bg-white shadow-md p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold">{product.product_name}</h2>
        <p className="text-gray-600">🏪 {product.shop_name}</p>
        <p className="mt-2">Harga: <span className="font-semibold">Rp {product.price.toLocaleString()}</span></p>
        <p>Jumlah: <span className="font-semibold">{quantity}</span></p>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white shadow-md p-4 rounded-md mb-6">
        <p>Subtotal: <span className="font-semibold">Rp {subtotal.toLocaleString()}</span></p>
        <p>Ongkir ({courier.toUpperCase()}): <span className="font-semibold">Rp {shippingCost.toLocaleString()}</span></p>
        <p className="text-lg mt-2">Total Bayar: <span className="font-bold text-blue-900">Rp {total.toLocaleString()}</span></p>
      </div>

      {/* Shipping Address */}
      <div className="bg-white shadow-md p-4 rounded-md mb-6">
        <h3 className="font-semibold mb-2">Alamat Pengiriman</h3>
        {addresses.length > 0 ? (
          <select
            className="w-full border border-gray-300 rounded-md p-2 mb-2"
            value={selectedAddressId ?? ''}
            onChange={e => setSelectedAddressId(Number(e.target.value))}
          >
            {addresses.map(a => (
              <option key={a.id} value={a.id}>
                {a.recipient_name} - {a.city}
              </option>
            ))}
            <option value="">+ Alamat Baru</option>
          </select>
        ) : null}

        {!selectedAddressId && (
          <div className="flex flex-col gap-2">
            <input
              className="border border-gray-300 rounded-md p-2"
              placeholder="Nama"
              onChange={e => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-md p-2"
              placeholder="HP"
              onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
            />
            <textarea
              className="border border-gray-300 rounded-md p-2"
              placeholder="Alamat"
              onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-md p-2"
              placeholder="Kota"
              onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-md p-2"
              placeholder="Kode Pos"
              onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Courier & Payment */}
      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold mb-2">Kurir</h3>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={courier}
            onChange={e => setCourier(e.target.value)}
          >
            <option value="jne">JNE</option>
            <option value="sicepat">SiCepat</option>
            <option value="pos">POS Indonesia</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Metode Pembayaran</h3>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            <option value="">Pilih</option>
            <option value="bca_va">BCA VA</option>
            <option value="bni_va">BNI VA</option>
            <option value="bri_va">BRI VA</option>
            <option value="qris">QRIS</option>
            <option value="gopay">GoPay</option>
          </select>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={!paymentMethod}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Checkout
      </button>
    </div>
  );
}
