'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // untuk cek data seller

  useEffect(() => {
    const checkSeller = async () => {
      try {
        const res = await axios.get('/api/seller/check'); // endpoint untuk cek seller
        if (res.data.exists) {
          // jika user sudah jadi seller, langsung ke dashboard
          router.push('/seller/dashboard');
        }
      } catch (err) {
        // jika error, biarkan tetap di form
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

      alert('Berhasil daftar seller');
      router.push('/seller/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal daftar seller');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <p>Memeriksa status seller...</p>;

  return (
    <>
      <h1>Daftar Jadi Seller</h1>

      <form onSubmit={submit} style={{ maxWidth: 400 }}>
        <div>
          <label>Nama Toko</label>
          <input
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Deskripsi Toko</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button disabled={loading} style={{ marginTop: 15 }}>
          {loading ? 'Menyimpan...' : 'Daftar'}
        </button>
      </form>
    </>
  );
}
