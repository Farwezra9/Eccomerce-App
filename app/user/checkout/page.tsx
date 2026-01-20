'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const SHIPPING_COST: Record<string, number> = {
  jne: 10000,
  sicepat: 9000,
  pos: 8000
};

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
    postal_code: ''
  });

  const [courier, setCourier] = useState('jne');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProductId(params.get('product_id'));
    setQuantity(Number(params.get('quantity') || 1));
  }, []);

  useEffect(() => {
    if (!productId) return;
    axios.get(`/api/user/products/${productId}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    axios.get('/api/user/addresses')
      .then(res => {
        setAddresses(res.data);
        if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Produk tidak ditemukan</p>;

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
        payment_method: paymentMethod
      });

      router.push(`/user/orders/${res.data.order_id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout gagal');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h1>Checkout</h1>

      <p><b>{product.product_name}</b></p>
      <p>Harga: Rp {product.price.toLocaleString()}</p>
      <p>Jumlah: {quantity}</p>

      <hr />

      <p>Subtotal: Rp {subtotal.toLocaleString()}</p>
      <p>Ongkir ({courier.toUpperCase()}): Rp {shippingCost.toLocaleString()}</p>
      <p><b>Total Bayar: Rp {total.toLocaleString()}</b></p>

      <hr />

      <h3>Alamat Pengiriman</h3>
      {addresses.length > 0 && (
        <select
          value={selectedAddressId || ''}
          onChange={e => setSelectedAddressId(Number(e.target.value))}
        >
          {addresses.map(a => (
            <option key={a.id} value={a.id}>
              {a.recipient_name} - {a.city}
            </option>
          ))}
          <option value="">+ Alamat Baru</option>
        </select>
      )}

      {!selectedAddressId && (
        <>
          <input placeholder="Nama" onChange={e => setNewAddress({ ...newAddress, recipient_name: e.target.value })} />
          <input placeholder="HP" onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
          <textarea placeholder="Alamat" onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} />
          <input placeholder="Kota" onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
          <input placeholder="Kode Pos" onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
        </>
      )}

      <h3>Kurir</h3>
      <select value={courier} onChange={e => setCourier(e.target.value)}>
        <option value="jne">JNE</option>
        <option value="sicepat">SiCepat</option>
        <option value="pos">POS Indonesia</option>
      </select>

      <h3>Pembayaran</h3>
      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <option value="">Pilih</option>
        <option value="bca_va">BCA VA</option>
        <option value="bni_va">BNI VA</option>
        <option value="bri_va">BRI VA</option>
        <option value="qris">QRIS</option>
        <option value="gopay">GoPay</option>
      </select>

      <button
        onClick={handleCheckout}
        style={{ marginTop: 20, padding: 10, background: 'green', color: 'white' }}
      >
        Bayar Sekarang
      </button>
    </div>
  );
}
