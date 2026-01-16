'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Navbar() {
   const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };
  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px",
        background: "#222",
      }}
    >
      <Link href="/" style={{ color: "#fff" }}>Home</Link>
      <Link href="/user/dashboard/" style={{ color: "#fff" }}>User</Link>
      <Link href="/seller/dashboard/" style={{ color: "#fff" }}>Seller</Link>
      <Link href="/admin/dashboard/" style={{ color: "#fff" }}>Admin</Link>
      <Link href="/auth/login/" style={{ color: "#fff" }}>Login</Link>
      <Link href="/auth/register/" style={{ color: "#fff" }}>register</Link>
      <button
        onClick={handleLogout}
        style={{
          background: "red",
          color: "#fff",
          border: "none",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
