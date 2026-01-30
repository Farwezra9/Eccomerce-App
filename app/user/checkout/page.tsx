'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  MapPin, Truck, CreditCard, ShoppingBag, 
  ChevronRight, Phone, User, Home 
} from 'lucide-react';

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
  pos: 8000,
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
    id: 0, recipient_name: '', phone: '', address: '', city: '', postal_code: '',
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
    axios.get('/api/user/addresses').then(res => {
      setAddresses(res.data);
      if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
    });
  }, []);

  const subtotal = product ? product.price * quantity : 0;
  const shippingCost = SHIPPING_COST[courier];
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      const { recipient_name, phone, address, city, postal_code } = newAddress;
      if (!recipient_name.trim() || !phone.trim() || !address.trim() || !city.trim() || !postal_code.trim()) {
        alert('Mohon lengkapi semua data alamat pengiriman!');
        return;
      }
    }

    if (!paymentMethod) {
      alert('Silakan pilih metode pembayaran!');
      return;
    }

    try {
      const shipping = selectedAddressId ? { id: selectedAddressId } : newAddress;
      const res = await axios.post('/api/user/checkout', {
        product_id: product?.product_id,
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!product) return <div className="text-center mt-20 font-bold text-red-500">Produk tidak ditemukan</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
        <span className="hover:text-indigo-600 cursor-pointer" onClick={() => router.push('/user/cart')}>Keranjang</span>
        <ChevronRight size={14} />
        <span className="font-bold text-indigo-600">Checkout</span>
      </div>

      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: SATU CARD BESAR */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Bagian 1: Alamat */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <MapPin size={22} />
                </div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Detail Pengiriman</h2>
              </div>

              {addresses.length > 0 && (
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                  value={selectedAddressId ?? ''}
                  onChange={e => setSelectedAddressId(e.target.value ? Number(e.target.value) : null)}
                >
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>{a.recipient_name} — {a.city} ({a.postal_code})</option>
                  ))}
                  <option value="">+ Tambah Alamat Baru</option>
                </select>
              )}

              {!selectedAddressId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <input
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    placeholder="Nama Penerima *"
                    value={newAddress.recipient_name}
                    onChange={e => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                  />
                  <input
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    placeholder="Nomor HP *"
                    value={newAddress.phone}
                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                  <textarea
                    className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW) *"
                    rows={2}
                    value={newAddress.address}
                    onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                  />
                  <input
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    placeholder="Kota *"
                    value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                  <input
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    placeholder="Kode Pos *"
                    value={newAddress.postal_code}
                    onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Bagian 2: Kurir & Pembayaran dalam Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Kurir */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Truck size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Metode Pengiriman</h3>
                </div>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
                  value={courier}
                  onChange={e => setCourier(e.target.value)}
                >
                  <option value="jne">JNE Reguler (Rp 10.000)</option>
                  <option value="sicepat">SiCepat Ekspres (Rp 9.000)</option>
                  <option value="pos">POS Indonesia (Rp 8.000)</option>
                </select>
              </div>

              {/* Pembayaran */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Metode Pembayaran</h3>
                </div>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-emerald-700"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="">Pilih Metode Bayar</option>
                  <option value="bca_va">BCA Virtual Account</option>
                  <option value="qris">QRIS (Gopay/OVO/Dana)</option>
                  <option value="gopay">GoPay / GoPay Later</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Ringkasan Pesanan */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-indigo-50/50 sticky top-24">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
              <ShoppingBag className="text-indigo-600" size={24} />
              Ringkasan Pesanan
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800 line-clamp-2 leading-snug">{product.product_name}</p>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{product.shop_name}</p>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Harga Satuan</span>
                <span className="text-slate-700">{formatPrice(product.price)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Jumlah (Qty)</span>
                <span className="text-slate-800">{quantity}x</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Subtotal Produk</span>
                <span className="text-slate-800 font-black">Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Biaya Pengiriman</span>
                <span className="text-slate-800 font-black">Rp {shippingCost.toLocaleString()}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">Total Tagihan</span>
                <span className="text-2xl font-black text-indigo-700 tracking-tighter">Rp {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2 group text-lg"
            >
              Checkout
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}