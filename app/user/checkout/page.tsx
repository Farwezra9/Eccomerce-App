'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  MapPin, Truck, CreditCard, ShoppingBag, 
  ChevronRight, ArrowRight, Plus, Edit2, X, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
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

  // FUNGSI CHECKOUT
  const handleCheckout = async () => {
   if (!product) return;

  // cek pembayaran
  if (!paymentMethod) {
    alert('Pilih metode pembayaran');
    return;
  }

  // cek alamat
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  if (!selectedAddress) {
    alert('Pilih alamat pengiriman');
    return;
  }
  
  try {
    const shipping = selectedAddressId
      ? { id: selectedAddressId }
      : newAddress;

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!product) return <div className="text-center mt-20 font-bold text-red-500">Produk tidak ditemukan</div>;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[11px] md:text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
        <Link href="/" className="hover:text-indigo-600 font-bold shrink-0 transition-colors">BelanjaAja</Link>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400 tracking-tight font-medium">Checkout</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Bagian Alamat */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <MapPin size={18} />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Alamat Pengiriman</h2>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all uppercase"
                >
                  <Edit2 size={12} /> Ubah Alamat
                </button>
              </div>

              {selectedAddress ? (
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700">{selectedAddress.recipient_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold tracking-tighter">Utama</span>
                    </div>
                    <span className="text-xs text-slate-500 font-bold">{selectedAddress.phone}</span>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.postal_code}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">
                    <button onClick={() => setIsModalOpen(true)} className="text-xs font-bold text-indigo-600">+ Pilih Alamat</button>
                </div>
              )}
            </div>

            {/* Kurir & Bayar */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-orange-600 rounded-lg shrink-0">
                    <Truck size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Pengiriman</h3>
                </div>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none text-xs font-bold appearance-none cursor-pointer focus:border-indigo-500 transition-all" value={courier} onChange={e => setCourier(e.target.value)}>
                  <option value="jne">JNE Reguler (10rb)</option>
                  <option value="sicepat">SiCepat (9rb)</option>
                  <option value="pos">POS Indo (8rb)</option>
                </select>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-emerald-600 rounded-lg shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Pembayaran</h3>
                </div>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none text-xs font-bold text-emerald-700 appearance-none cursor-pointer focus:border-indigo-500 transition-all" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="">Pilih Pembayaran</option>
                  <option value="bca_va">BCA</option>
                  <option value="bni_va">BNI</option>
                  <option value="bri_va">BRI</option>
                  <option value="qris">QRIS (Gopay/OVO)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded border border-slate-200 shadow-sm sticky top-6">
            <h2 className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <ShoppingBag size={16} className="text-indigo-600" /> Ringkasan Pesanan
            </h2>
            <div className="space-y-3 pb-4 border-b border-slate-50">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-800 line-clamp-1 flex-1 pr-4">{product.product_name}</span>
                <span className="text-xs font-bold text-slate-400">{quantity}x</span>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Ongkir</span>
                <span className="text-slate-700">{formatPrice(shippingCost)}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-md font-black text-indigo-700 tracking-tighter">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-all shadow-md text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
              Checkout <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ALAMAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Pilih Alamat Pengiriman</h3>
              <button onClick={() => {setIsModalOpen(false); setIsAddingNew(false);}} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {!isAddingNew ? (
                <>
                  {addresses.map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => {setSelectedAddressId(a.id); setIsModalOpen(false);}}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer group relative ${selectedAddressId === a.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200'}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-900">{a.recipient_name}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{a.phone}</span>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{a.address}, {a.city}</p>
                      </div>
                      {selectedAddressId === a.id && (
                        <CheckCircle2 size={18} className="absolute top-4 right-4 text-indigo-600" />
                      )}
                    </div>
                  ))}

                  {addresses.length < 2 && (
                    <button 
                      onClick={() => setIsAddingNew(true)}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                    >
                      <Plus size={16} /> Tambah Alamat Baru
                    </button>
                  )}

                  {addresses.length >= 2 && (
                    <p className="text-center text-[10px] text-slate-400 font-medium italic">
                      Maksimal 2 alamat tersimpan.
                    </p>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-bottom-4 duration-300">
                  <input className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs" placeholder="Nama Penerima" value={newAddress.recipient_name} onChange={e => setNewAddress({...newAddress, recipient_name: e.target.value})} />
                  <input className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs" placeholder="No HP" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                  <textarea className="md:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs" placeholder="Alamat Lengkap" rows={2} value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} />
                  <input className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs" placeholder="Kota" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                  <input className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs" placeholder="Kode Pos" value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} />
                  <div className="md:col-span-2 flex gap-2 pt-2">
                    <button onClick={() => setIsAddingNew(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Batal</button>
                    <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-indigo-100 shadow-lg">Simpan & Pilih</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}