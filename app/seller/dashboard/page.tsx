'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const check = async () => {
    try {
      const res = await axios.get('/api/seller/check');
      if (!res.data.exists) {
        router.replace('/user/register-seller');
        return;
      }
      setLoading(false);
    } catch {
      router.replace('/auth/login');
    }
  };

  check();
}, [router]);


  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1>Dashboard Seller</h1>
      <p>Selamat datang, seller!</p>
    </>
  );
}
