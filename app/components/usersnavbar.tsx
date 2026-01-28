'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, User } from 'lucide-react';

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
        const resSeller = await axios.get('/api/seller/check');
        setIsSeller(resSeller.data.exists);

        const resProfile = await axios.get('/api/profile');
        setProfile(resProfile.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          await fetch('/api/auth/logout', { method: 'POST'});
          router.push('/auth/login');
        } else {
          console.error(err);
        }
      }
    };
    fetchData();
  }, [router]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST'});
    router.push('/auth/login');
  };

  if (isSeller === null || !profile) {
    return (
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 text-white flex items-center justify-between shadow-md">
        Memuat...
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-3 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
        <ShoppingBag className="h-6 w-6" />
        TOKO
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-6 text-white text-sm md:text-base">
        {/* User info */}
        <span className="hidden md:flex items-center gap-1">
          <User className="h-4 w-4" />
          Hai, <b>{profile.name}</b>
        </span>

        {/* Links */}
        <Link href="/user/dashboard" className="hover:underline">
          Produk
        </Link>
        <Link href="/user/cart" className="hover:underline">
          Keranjang
        </Link>
        <Link href="/user/orders" className="hover:underline">
          Pesanan
        </Link>

        {isSeller ? (
          <Link
            href="/seller/dashboard"
            className="text-green-300 hover:underline"
          >
            Toko Saya
          </Link>
        ) : (
          <Link href="/user/register-seller" className="hover:underline">
            Jadi Seller
          </Link>
        )}


        {/* Profile */}
        <Link href="/user/profile" className="hover:underline">
          Profile
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          className="hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
