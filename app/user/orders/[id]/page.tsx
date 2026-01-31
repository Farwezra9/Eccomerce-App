'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  ChevronRight, Package, MapPin, CreditCard, 
  Truck, Calendar, Banknote, ShieldCheck, Receipt
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  product_image: string; // Tambahkan ini
}

interface OrderDetail {
  order_id: number;
  total: number;
  order_status: string;
  created_at: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  payment_method: string | null;
  payment_status: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/user/orders/${id}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getStatusColor = (status: string | null) => {
    const s = status?.toLowerCase();
    if (['pending', 'waiting'].includes(s || '')) return 'text-amber-500 bg-amber-50';
    if (['paid', 'success', 'completed', 'delivered'].includes(s || '')) return 'text-emerald-500 bg-emerald-50';
    if (['cancelled', 'failed', 'expire'].includes(s || '')) return 'text-red-500 bg-red-50';
    return 'text-slate-400 bg-slate-50';
  };

  const cancelOrder = async () => {
    if (!confirm('Yakin ingin membatalkan order ini?')) return;
    setCancelLoading(true);
    try {
      await axios.post(`/api/user/orders/${id}/cancel`);
      const res = await axios.get(`/api/user/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      alert('Gagal membatalkan order');
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order || !snapLoaded) return alert('Tunggu sebentar, sistem pembayaran sedang disiapkan');
    setPayLoading(true);
    try {
      const res = await axios.post('/api/payment/midtrans', { order_id: order.order_id });
      // @ts-ignore
      window.snap.pay(res.data.snapToken, {
        onSuccess: async () => {
          const updated = await axios.get(`/api/user/orders/${id}`);
          setOrder(updated.data);
        },
        onPending: async () => {
          const updated = await axios.get(`/api/user/orders/${id}`);
          setOrder(updated.data);
        },
        onError: () => alert('Pembayaran gagal'),
      });
    } catch (err) {
      alert('Gagal memproses pembayaran');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!order) return (
    <div className="text-center py-20 italic font-bold text-slate-400 uppercase tracking-widest">Order tidak ditemukan</div>
  );

  const canCancel = order.order_status === 'pending' && order.payment_status === 'pending';
  const canPay = canCancel;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1 text-[11px] md:text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
        <Link href="/" className="hover:text-indigo-600 font-bold shrink-0 transition-colors">BelanjaAja</Link>
        <ChevronRight size={12} className="text-slate-300 shrink-0" />
        
        <Link href="/user/orders" className="hover:text-indigo-600 font-bold shrink-0 transition-colors">
          Pesanan Saya
        </Link>
        <ChevronRight size={12} className="text-slate-300 shrink-0" />
        
        <span className="text-slate-500 truncate max-w-[200px] md:max-w-xs tracking-tight">
          Detail Pesanan #{order.order_id}
        </span>
      </nav>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-slate-800 tracking-tight flex items-center gap-3">
            <Receipt className="text-indigo-600" size={24} />
            ORDER #{order.order_id}
          </h1>
        </div>

        <div className="flex gap-3">
          {canCancel && (
            <button 
              onClick={cancelOrder} 
              disabled={cancelLoading}
              className="px-6 py-3 border-2 border-red-100 text-red-500 font-black rounded text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelLoading ? 'MEMBATALKAN...' : 'BATALKAN PESANAN'}
            </button>
          )}
          {canPay && (
            <button 
              onClick={handlePayment} 
              disabled={payLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-black rounded text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {payLoading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            
            {/* Bagian 1: Status */}
            <div className="p-4 flex flex-wrap gap-6 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-800 uppercase tracking-tight">Waktu Transaksi</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getStatusColor(order.order_status).split(' ')[1].replace('bg-', 'border-')} ${getStatusColor(order.order_status)}`}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-800 uppercase tracking-tight">Status Pesanan</p>
                  <p className={`text-xs font-black uppercase ${getStatusColor(order.order_status).split(' ')[0]}`}>
                    {order.order_status}
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian 2: Alamat */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MapPin size={18} />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Informasi Pengiriman</h2>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-slate-700">{order.recipient_name}</span>
                   <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold tracking-tighter">Utama</span>
                </div>
                <p className="text-xs text-slate-500 font-bold">{order.recipient_phone}</p>
                <div className="pt-2 border-t border-slate-200/60 mt-2 text-xs text-slate-600 leading-relaxed">
                  {order.address}, {order.city}, {order.postal_code}
                </div>
              </div>
            </div>

            {/* Bagian 3: Kurir */}
            <div className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Jasa Pengiriman</p>
                    <p className="text-sm text-slate-800 uppercase">{order.courier_name}</p>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">No. Resi</p>
                    <p className="text-xs text-indigo-500 tracking-widest uppercase font-bold">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian 4: Item Produk (DENGAN GAMBAR) */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Package size={18} />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Barang yang Dibeli</h2>
              </div>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                    {/* Gambar Produk */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                      <img 
                        src={item.product_image || '/placeholder-product.png'} 
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Info Produk */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-medium text-slate-800 truncate mb-1 uppercase tracking-tight">
                        {item.product_name}
                      </h2>
                      <p className="text-sm text-slate-500 uppercase tracking-tight">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Subtotal Item */}
                    <div className="text-right">
                      <p className="text-sm text-emerald-700">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: RINGKASAN PEMBAYARAN */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <div className="bg-slate-800 text-white p-8 rounded shadow-sm shadow-indigo-100 border border-white/5 overflow-hidden relative">
            <Banknote className="absolute -right-6 -bottom-6 text-slate-700 opacity-40 -rotate-12" size={120} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-white/10 rounded-lg text-emerald-700"><CreditCard size={20} /></div>
                <h2 className="text-lg font-bold tracking-tight uppercase">Pembayaran</h2>
              </div>
              <div className="space-y-5 mb-8 text-sm">
                <div className="flex justify-between items-center">
                  <span className="tracking-widest uppercase text-[10px] font-bold">Metode</span>
                  <span className="uppercase tracking-widest font-bold">{order.payment_method || 'MIDTRANS'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-widest uppercase text-[10px] font-bold">Status</span>
                  <span className={`px-3 py-1 rounded-lg uppercase text-[10px] font-black tracking-widest ${order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {order.payment_status || 'WAITING'}
                  </span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Total Transaksi</p>
                <p className="text-2xl text-emerald-500 tracking-tighter">{formatPrice(order.total)}</p>
              </div>
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-[10px] text-white/40 leading-relaxed italic">
                *Pembayaran diverifikasi secara otomatis oleh sistem keamanan Midtrans.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}