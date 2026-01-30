import Navbar from '@/app/components/admin/navbar';
import Footer from '@/app/components/admin/footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
