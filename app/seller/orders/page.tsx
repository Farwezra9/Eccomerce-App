'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, Truck, PackageCheck, MapPin, 
  Receipt, ClipboardList, ExternalLink, Package
} from 'lucide-react';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [resi, setResi] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/seller/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Gagal load pesanan", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await axios.post('/api/seller/orders', {
        order_id: orderId,
        status,
        tracking_number: resi[orderId]
      });
      setResi(prev => ({ ...prev, [orderId]: '' }));
      loadOrders();
    } catch (err) {
      alert("Gagal memperbarui status pesanan");
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing': return { text: 'Perlu Diproses', color: 'bg-amber-50 text-amber-700 ring-amber-200/50' };
      case 'packed': return { text: 'Siap Kirim', color: 'bg-blue-50 text-blue-700 ring-blue-200/50' };
      case 'shipped': return { text: 'Dalam Pengiriman', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200/50' };
      default: return { text: status, color: 'bg-slate-50 text-slate-700 ring-slate-200/50' };
    }
  };
const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  if (loading && orders.length === 0) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingBag className="text-blue-600 h-9 w-9" />
            Daftar Pesanan
          </h1>
          <p className="text-slate-500 font-medium">Kelola pesanan dan pantau pengiriman produk Anda</p>
        </div>
        
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto shrink-0">
          {['all', 'processing', 'packed', 'shipped'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filterStatus === s ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s === 'all' ? 'Semua' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-10">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const status = getStatusLabel(order.status);
          return (
            <div key={order.id} className="bg-white rounded-2xl ring-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden transition-all hover:ring-blue-200">
              <div className="p-8">
                
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Receipt size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Order #{order.id}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-full ring-1 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                    {status.text}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* 1. Barang Pesanan */}
                  <div className="space-y-4 lg:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Package size={14} className="text-blue-500" /> Barang Pesanan
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl ring-1 ring-slate-100 bg-slate-50/50">
                          <div className="h-10 w-10 bg-white rounded-lg ring-1 ring-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                             {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <Package size={16} className="text-slate-300" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{item.product_name}</p>
                            <p className="text-[10px] font-bold text-blue-600 mt-0.5">{item.quantity} Unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Alamat */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} className="text-blue-500" /> Alamat Kirim
                    </p>
                    <div className="bg-slate-50/80 p-5 rounded-[1.5rem] ring-1 ring-slate-100">
                      <p className="font-extrabold text-slate-800 text-sm mb-1">{order.recipient_name || order.buyer_name}</p>
                      <p className="text-[11px] font-bold text-blue-600 mb-3">{order.recipient_phone || '-'}</p>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium line-clamp-3 italic">
                        "{order.address}, {order.city}, {order.postal_code}"
                      </p>
                    </div>
                  </div>

                  {/* 3. Pengiriman & Pembayaran */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Truck size={14} className="text-blue-500" /> Informasi
                    </p>
                    <div className="bg-slate-50/80 p-5 rounded-[1.5rem] ring-1 ring-slate-100 space-y-4">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Kurir</p>
                        <p className="text-xs font-bold text-slate-700 uppercase">{order.courier_name || 'Reguler'}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Total Pendapatan</p>
                        <p className="text-lg font-black text-emerald-700">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Aksi */}
                  <div className="flex flex-col justify-center space-y-4">
                    {order.status === 'processing' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'packed')}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-95"
                      >
                        <PackageCheck size={20} /> Siapkan Barang
                      </button>
                    )}

                    {order.status === 'packed' && (
                      <div className="space-y-3">
                        <div className="relative">
                          <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            placeholder="Input No. Resi..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 ring-1 ring-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={resi[order.id] || ''}
                            onChange={e => setResi(prev => ({ ...prev, [order.id]: e.target.value }))}
                          />
                        </div>
                        <button 
                          disabled={!resi[order.id]}
                          onClick={() => updateStatus(order.id, 'shipped')}
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-40 flex items-center justify-center gap-3 active:scale-95"
                        >
                          <ExternalLink size={20} /> Konfirmasi Kirim
                        </button>
                      </div>
                    )}

                    {order.status === 'shipped' && (
                      <div className="bg-emerald-50 ring-1 ring-emerald-100 p-6 rounded-[1.5rem] text-center">
                        <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest mb-2">Barang Dalam Perjalanan</p>
                        <p className="text-xs font-bold text-emerald-600 break-all">Resi: {order.tracking_number}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-32 bg-white rounded-[3rem] ring-2 ring-dashed ring-slate-100 shadow-sm">
            <ShoppingBag className="mx-auto text-slate-100 mb-6" size={80} />
            <p className="text-slate-400 font-bold text-lg">Belum ada pesanan.</p>
          </div>
        )}
      </div>
    </div>
  );
}