'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkSeller = async () => {
      try {
        const res = await axios.get('/api/seller/check');
        if (res.data.exists) {
          router.push('/seller/dashboard');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    checkSeller();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/seller/register', {
        shop_name: shopName,
        shop_description: description,
      });
      
      setIsSuccess(true);
      // Redirect setelah 1.5 detik agar user bisa melihat pesan sukses
      setTimeout(() => router.push('/seller/dashboard'), 9500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal daftar seller');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Memeriksa status toko...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
          <Store size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Buka Toko Gratis</h1>
        <p className="text-slate-500 mt-2">Mulai langkah suksesmu di BelanjaAja hari ini.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
        {isSuccess ? (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
            <p className="text-slate-500 mt-2">Menyiapkan dashboard toko Anda...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {/* Input Nama Toko */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Toko Berkah Jaya"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                required
              />
            </div>

            {/* Input Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Deskripsi Singkat
              </label>
              <textarea
                placeholder="Ceritakan apa yang Anda jual..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-800 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm animate-shake">
                <AlertCircle size={16} />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6 px-4">
        Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi Seller BelanjaAja.
      </p>
    </div>
  );
}