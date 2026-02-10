'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle mata
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const role = res.data.role;

      if (role === 'admin' || role === 'superadmin') router.push('/admin/dashboard');
      else if (role === 'user') router.push('/');
      else router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm shadow-sm";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Header Ramping */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 mb-3 transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Belanja Aja</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Masuk ke akun Anda</p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl mb-4 flex items-center gap-2 animate-shake">
            <Lock size={14} className="flex-shrink-0" />
            <p className="text-[9px] font-black uppercase tracking-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="group">
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="name@email.com"
                className={inputClass}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass}>Password</label>
              <a href="#" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">Lupa?</a>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
              />

              {/* Tombol Toggle Mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-70 mt-2 shadow-lg shadow-slate-200"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span className="text-xs tracking-widest uppercase">Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-slate-400 font-bold text-[9px] uppercase tracking-widest pt-4 border-t border-slate-50">
          Belum punya akun? <a href="/auth/register" className="text-indigo-600 font-black hover:underline">Daftar</a>
        </p>
      </div>
    </div>
  );
}