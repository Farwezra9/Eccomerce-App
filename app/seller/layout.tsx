import SellerNavbar from '@/app/components/sallersnavbar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SellerNavbar />
      <main style={{ padding: 20 }}>
        {children}
      </main>
    </>
  );
}
