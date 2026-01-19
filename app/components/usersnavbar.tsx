'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cek apakah seller
        const resSeller = await axios.get('/api/seller/check');
        setIsSeller(resSeller.data.exists);

        // Ambil profil user
        const resProfile = await axios.get('/api/profile');
        setProfile(resProfile.data);
      } catch (err) {
        console.error(err);
        setIsSeller(false);
      }
    };

    fetchData();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  if (isSeller === null || !profile) return <nav style={styles.nav}>Memuat...</nav>;

  return (
    <nav style={styles.nav}>
      <Link href="/" style={styles.logo}>TOKO</Link>

      <div style={styles.menu}>
        <span>Hai, {profile.name} ({profile.email})</span>

        <Link href="/user/dashboard">Produk</Link>
        <Link href="/user/cart">Keranjang</Link>
        <Link href="/user/orders">Pesanan</Link>

        {isSeller ? (
          <Link href="/seller/dashboard">Toko Saya</Link>
        ) : (
          <Link href="/user/register-seller">Daftar Jadi Seller</Link>
        )}
        <Link href="/user/profile">Profile</Link>

        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #ddd',
  },
  logo: {
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  menu: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  logout: {
    background: 'red',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    cursor: 'pointer',
  },
};
