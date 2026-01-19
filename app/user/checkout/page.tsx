'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

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

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const product_id = searchParams.get('product_id');
  const quantityParam = searchParams.get('quantity');

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(Number(quantityParam || 1));
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<Address>({
    id: 0,
    recipient_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  const [courier, setCourier] = useState('jne');
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  // Load product
  useEffect(() => {
    if (!product_id) return;
    axios.get(`/api/user/products/${product_id}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [product_id]);

  // Load user's saved addresses
  useEffect(() => {
    axios.get('/api/user/addresses')
      .then(res => {
        setAddresses(res.data);
        if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
      });
  }, []);

  if (!product_id) return <p>Produk tidak ditemukan.</p>;
  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Produk tidak ditemukan.</p>;

  const handleCheckout = async () => {
    try {
      const addressId = selectedAddressId || null;
      const shipping = addressId ? { id: addressId } : newAddress;

      const res = await axios.post('/api/user/checkout', {
        product_id: product.product_id,
        quantity,
        shipping,
        courier,
        payment_method: paymentMethod
      });

      alert('Checkout berhasil!');
      router.push(`/user/orders/${res.data.order_id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Checkout gagal');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h1>Checkout: {product.product_name}</h1>
      <p>💰 Harga: Rp {product.price.toLocaleString()}</p>
      <p>Jumlah: {quantity}</p>
      <p>Total: Rp {(product.price * quantity).toLocaleString()}</p>

      <h2>Alamat Pengiriman</h2>
      {addresses.length > 0 ? (
        <select
          value={selectedAddressId || undefined}
          onChange={e => setSelectedAddressId(Number(e.target.value))}
        >
          {addresses.map(addr => (
            <option key={addr.id} value={addr.id}>
              {addr.recipient_name} - {addr.address}, {addr.city}
            </option>
          ))}
          <option value="">+ Tambah alamat baru</option>
        </select>
      ) : null}

      {!selectedAddressId && (
        <div>
          <input
            placeholder="Nama Penerima"
            value={newAddress.recipient_name}
            onChange={e => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
          />
          <input
            placeholder="No HP"
            value={newAddress.phone}
            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
          />
          <textarea
            placeholder="Alamat"
            value={newAddress.address}
            onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
          />
          <input
            placeholder="Kota"
            value={newAddress.city}
            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
          />
          <input
            placeholder="Kode Pos"
            value={newAddress.postal_code}
            onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
          />
        </div>
      )}

      <h2>Kurir</h2>
      <select value={courier} onChange={e => setCourier(e.target.value)}>
        <option value="jne">JNE</option>
        <option value="sicepat">SiCepat</option>
        <option value="pos">POS Indonesia</option>
      </select>

      <h2>Pembayaran</h2>
      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <option value="transfer">Transfer Bank</option>
        <option value="ewallet">E-Wallet</option>
      </select>

      <button onClick={handleCheckout} style={{ marginTop: 16, padding: 8, background: 'green', color: 'white' }}>
        Bayar Sekarang
      </button>
    </div>
  );
}
