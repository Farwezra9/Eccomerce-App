'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Lock, ArrowRight, UserPlus, 
  Loader2, ShieldCheck, CheckCircle2, Eye, EyeOff 
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle mata
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== rePassword) {
      return setError('Password tidak cocok');
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/register', { name, email, password });
      setTimeout(() => router.push('/auth/login'), 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all font-bold text-slate-700 placeholder:text-slate-300 text-sm shadow-sm";
  const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Header Ramping */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-100 mb-2 transform rotate-3">
          <UserPlus size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Belanja Aja</h1>
        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest leading-none">Buat akun baru Anda</p>
      </div>

      {/* Register Card */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-xl shadow-slate-200/50">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-xl mb-4 flex items-center gap-2 animate-shake">
            <ShieldCheck size={14} className="flex-shrink-0" />
            <p className="text-[9px] font-black uppercase tracking-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name Field */}
          <div className="group">
            <label className={labelClass}>Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="group">
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
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

          {/* Password Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••"
                  className={inputClass.replace('pl-9', 'pl-8')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="group">
              <label className={labelClass}>Confirm</label>
              <div className="relative">
                <CheckCircle2 size={15} className={
                  `absolute left-3 top-1/2 -translate-y-1/2 transition-colors 
                  ${rePassword && password === rePassword ? 'text-emerald-500' : 'text-slate-400'}`
                } />
                <input
                  type={showPassword ? "text" : "password"}
                  value={rePassword}
                  onChange={e => setRePassword(e.target.value)}
                  required
                  placeholder="••••"
                  className={`${inputClass.replace('pl-9', 'pl-8')} 
                    ${rePassword && password !== rePassword ? 'border-red-200 bg-red-50/30' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-70 mt-1 shadow-lg shadow-slate-200"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span className="text-xs tracking-widest uppercase">Get Started</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-slate-400 font-bold text-[9px] uppercase tracking-widest pt-4 border-t border-slate-50">
          Sudah punya akun? <a href="/auth/login" className="text-emerald-600 font-black hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}