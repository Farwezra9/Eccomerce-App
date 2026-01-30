'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, ArrowRight, ChevronLeft, 
  Clock, CheckCircle2, Truck, XCircle, CreditCard 
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  total: number;
  order_status: string;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  pending: { label: 'MENUNGGU', class: 'bg-amber-100 text-amber-700', icon: Clock },
  paid: { label: 'DIBAYAR', class: 'bg-blue-100 text-blue-700', icon: CreditCard },
  shipped: { label: 'DIKIRIM', class: 'bg-purple-100 text-purple-700', icon: Truck },
  completed: { label: 'SELESAI', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'BATAL', class: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/user/orders')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.push('/user/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Kembali Belanja
      </button>

      {/* Header Banner (Identik dengan Cart) */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-700 text-white p-8 rounded-2xl shadow-xl mb-10 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Package size={32} />
            Pesanan Saya
          </h1>
          <p className="mt-2 text-indigo-100 font-medium opacity-90">
            Pantau status pengiriman dan riwayat belanja kamu di sini.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-lg">Belum ada riwayat pesanan</p>
          <button 
            onClick={() => router.push('/user/dashboard')}
            className="mt-4 text-indigo-600 font-bold hover:underline"
          >
            Mulai Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const status = statusConfig[order.order_status] || { label: order.order_status, class: 'bg-gray-100 text-gray-700', icon: Clock };
            const StatusIcon = status.icon;

            return (
              <div key={order.order_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-indigo-100 transition-all">
                {/* Header Card */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 tracking-widest uppercase">ID: #{order.order_id}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${status.class}`}>
                    <StatusIcon size={12} strokeWidth={3} />
                    {status.label}
                  </div>
                </div>

                {/* List Produk dalam Pesanan */}
                <div className="divide-y divide-slate-50">
                  {order.items.map(item => (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                        <img 
                          src={item.product_image || '/placeholder.png'} 
                          alt={item.product_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-800 font-bold truncate">{item.product_name}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                          {item.quantity} Barang x {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 tracking-tight">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Card */}
                <div className="p-4 bg-white border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Total Bayar</p>
                    <p className="text-xl font-black text-emerald-700 tracking-tighter">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/user/orders/${order.order_id}`}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 group"
                  >
                    LIHAT DETAIL
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}