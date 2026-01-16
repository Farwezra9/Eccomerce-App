'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const role = res.data.role; // ambil role langsung dari response

      // Redirect berdasarkan role
      if (role === 'superadmin' || role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/user/dashboard');
      }
      } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <button type="submit" style={{ marginTop: '15px' }}>Login</button>
      </form>
    </>
  );
}
