'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  ChevronLeft, Package, MapPin, CreditCard, 
  Truck, Calendar, Hash, ArrowRight, ShieldCheck,
  AlertCircle, Receipt
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
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
    if (['processing', 'shipped'].includes(s || '')) return 'text-blue-500 bg-blue-50';
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
      const snapToken = res.data.snapToken;

      // @ts-ignore
      window.snap.pay(snapToken, {
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
    <div className="text-center py-20">
      <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
      <p className="font-bold text-slate-500">Order tidak ditemukan</p>
    </div>
  );

  const canCancel = order.order_status === 'pending' && order.payment_status === 'pending';
  const canPay = canCancel;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back & Title */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/user/orders')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors"
        >
          <ChevronLeft size={20} />
          Riwayat Pesanan
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Receipt className="text-indigo-600" />
              Detail Pesanan
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">ID Transaksi: #{order.order_id}</p>
          </div>
          
          <div className="flex gap-3">
            {canCancel && (
              <button 
                onClick={cancelOrder} 
                disabled={cancelLoading}
                className="px-6 py-3 border-2 border-red-100 text-red-500 font-black rounded-2xl text-xs hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
              >
                {cancelLoading ? 'MEMBATALKAN...' : 'BATALKAN PESANAN'}
              </button>
            )}
            {canPay && (
              <button 
                onClick={handlePayment} 
                disabled={payLoading}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {payLoading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Satu Card Besar untuk Semua Info */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            
            {/* Bagian 1: Ringkasan Status */}
            <div className="p-8 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Pesan</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${getStatusColor(order.order_status)}`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pesanan</p>
                  <p className={`text-sm font-black uppercase italic ${getStatusColor(order.order_status).split(' ')[0]}`}>{order.order_status}</p>
                </div>
              </div>
            </div>

            {/* Bagian 2: Informasi Pengiriman */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-indigo-600" size={20} />
                <h2 className="font-black text-slate-800 uppercase tracking-tight">Informasi Pengiriman</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Penerima</p>
                  <p className="font-bold text-slate-800 text-lg">{order.recipient_name || '-'}</p>
                  <p className="text-slate-500 font-medium text-sm mt-1">{order.recipient_phone || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {order.address ? `${order.address}, ${order.city}, ${order.postal_code}` : 'Alamat belum diatur'}
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-600">
                  <Truck size={18} />
                  <span className="text-sm font-bold">Kurir: <span className="text-slate-800 uppercase">{order.courier_name || 'Standard'}</span></span>
                </div>
                {order.tracking_number && (
                   <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Resi Pengiriman</p>
                      <p className="text-xs font-black text-indigo-600 tracking-widest">{order.tracking_number}</p>
                   </div>
                )}
              </div>
            </div>

            {/* Bagian 3: Barang yang Dibeli */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Package className="text-indigo-600" size={20} />
                <h2 className="font-black text-slate-800 uppercase tracking-tight">Barang yang Dibeli</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {order.items.map(item => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{item.product_name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                        {item.quantity} Unit x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-black text-slate-800 italic">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

       {/* Kolom Kanan: Rincian Pembayaran */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white/10 rounded-2xl">
                <CreditCard size={20} className="text-indigo-400" />
              </div>
              <h2 className="text-lg font-black tracking-tight uppercase">Pembayaran</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Metode</span>
                <span className="text-sm font-black uppercase tracking-tighter">{order.payment_method || 'Belum dipilih'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Status Bayar</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {order.payment_status || 'pending'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Pembayaran</p>
              <p className="text-3xl font-black text-emerald-400 tracking-tighter italic">
                {formatPrice(order.total)}
              </p>
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-medium text-white/60 leading-relaxed italic">
                  *Segala bentuk pembayaran melalui Midtrans dijamin aman dan terenkripsi secara otomatis.
                </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}