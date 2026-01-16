'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerNavbar() {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link href="/seller/dashboard" style={styles.logo}>
          Seller Panel
        </Link>

        <Link href="/seller/products" style={styles.link}>
          Produk
        </Link>

        <Link href="/seller/orders" style={styles.link}>
          Pesanan
        </Link>
      </div>

      <button onClick={logout} style={styles.logout}>
        Logout
      </button>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: '#1f2937',
  },
  left: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '18px',
  },
  link: {
    color: '#e5e7eb',
    textDecoration: 'none',
  },
  logout: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};
