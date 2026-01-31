'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, ArrowRight, ChevronRight, 
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
  const [activeTab, setActiveTab] = useState('all');

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

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === activeTab);

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'pending', label: 'Menunggu' },
    { id: 'paid', label: 'Dibayar' },
    { id: 'shipped', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Batal' },
  ];

  // Cari label tab aktif untuk ditampilkan di pesan "Empty State"
  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
        <Link href="/" className="hover:text-indigo-600 font-bold shrink-0 transition-colors">BelanjaAja</Link>
        <ChevronRight size={12} className="text-slate-300 shrink-0" />
        <span className="text-slate-500 truncate max-w-[200px] tracking-tight">
          Pesanan Saya
        </span>
      </nav>

      {/* Tab Navigasi - Full Width */}
      <div className="mb-8 border-b border-slate-200">
        <div className="flex w-full justify-between items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-4 text-[10px] md:text-sm font-bold transition-all relative text-center ${
                activeTab === tab.id 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-sm px-4">
            Tidak ada pesanan {activeTab !== 'all' ? `dengan status ${activeTabLabel}` : ''}
          </p>
          <button 
            onClick={() => activeTab === 'all' ? router.push('/user/dashboard') : setActiveTab('all')}
            className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
          >
            {activeTab === 'all' ? 'Mulai Belanja Sekarang' : 'Lihat Semua Pesanan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const status = statusConfig[order.order_status] || { label: order.order_status, class: 'bg-gray-100 text-gray-700', icon: Clock };
            const StatusIcon = status.icon;

            return (
              <div key={order.order_id} className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden hover:border-indigo-100 transition-all">
                {/* Header Card */}
                <div className="p-3.5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">#{order.order_id}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest ${status.class}`}>
                    <StatusIcon size={10} strokeWidth={3} />
                    {status.label}
                  </div>
                </div>

                {/* List Produk */}
                <div className="divide-y divide-slate-50">
                  {order.items.map(item => (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                        <img 
                          src={item.product_image || '/placeholder.png'} 
                          alt={item.product_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-800 text-sm font-medium truncate">{item.product_name}</h3>
                        <p className="text-sm text-slate-500 uppercase mt-0.5">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-emerald-700 tracking-tight">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Card */}
                <div className="p-3.5 bg-white border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-slate-800 text-sm font-medium truncate">SubTotal + Ongkir</p>
                    <p className="text-sm font-black text-emerald-700 tracking-tighter">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/user/orders/${order.order_id}`}
                    className="px-5 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-black rounded-lg text-[10px] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
                  >
                    DETAIL
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
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