'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  User, Mail, Shield, MapPin, Phone, 
  Plus, Pencil, Trash2, X, Save, 
  Loader2, Building2 
} from 'lucide-react';

interface Address {
  id: number;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  created_at: string;
  addresses: Address[];
}

const emptyForm = {
  recipient_name: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await axios.get('/api/profile');
      setProfile(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.replace('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `/api/user/addresses/${editingId}` : `/api/user/addresses`;
      const method = editingId ? 'put' : 'post';
      await axios({ method, url, data: form });
      
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadProfile();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan alamat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus alamat ini?')) return;
    try {
      await axios.delete(`/api/user/addresses/${id}`);
      loadProfile();
    } catch (err) {
      alert('Gagal menghapus alamat');
    }
  };

  if (loading || !profile) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Memuat Profil...</p>
      </div>
    </div>
  );

  const canAdd = profile.addresses.length < 2;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-slate-50 min-h-screen">
      
   
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <User size={40} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Mail size={14} /> {profile.email}
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              <Shield size={12} /> {profile.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-600" /> Alamat Pengiriman
            </h2>
            {canAdd && !showForm && (
              <button 
                onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
                className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Tambah
              </button>
            )}
          </div>

          {profile.addresses.length === 0 && !showForm && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-medium">
              Belum ada alamat pengiriman.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {profile.addresses.map(addr => (
              <div key={addr.id} className="bg-white border border-slate-200 p-6 rounded-3xl group relative overflow-hidden shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{addr.recipient_name}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{addr.address}</p>
                    <p className="text-slate-500 text-sm">{addr.city}, {addr.postal_code}</p>
                    <p className="text-indigo-600 text-sm font-semibold flex items-center gap-1.5 mt-2">
                      <Phone size={14} /> {addr.phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingId(addr.id); setForm(addr); setShowForm(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          {!showForm ? (
            <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold mb-2">Info Alamat</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Anda dapat menyimpan maksimal 2 alamat berbeda (Contoh: Rumah & Kantor).
                </p>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(profile.addresses.length / 2) * 100}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase">
                  Kuota: {profile.addresses.length} / 2
                </p>
              </div>
              <Building2 className="absolute -right-6 -bottom-6 text-slate-700 opacity-50" size={100} />
            </div>
          ) : (
            <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">
                  {editingId ? 'Edit Alamat' : 'Alamat Baru'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Penerima</label>
                  <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={form.recipient_name}
                    onChange={e => setForm({ ...form, recipient_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Kota</label>
                    <input
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Kodepos</label>
                    <input
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={form.postal_code}
                      onChange={e => setForm({ ...form, postal_code: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">No. HP</label>
                  <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Alamat Lengkap</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px] resize-none"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Simpan
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}