'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { name, email, password});
      router.push('/auth/login'); // pastikan redirect ke halaman login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '10px' }}>
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

        <button type="submit" style={{ marginTop: '15px' }}>Register</button>
      </form>
    </>
  );
}
