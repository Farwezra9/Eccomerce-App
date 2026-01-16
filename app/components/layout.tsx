// app/components/LayoutWrapper.tsx
'use client';
import Navbar from './navbar';
import Footer from './footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>{children}</main>
      <Footer />
    </>
  );
}
