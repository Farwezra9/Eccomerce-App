import SellerSidebar from '@/app/components/seller/sellerssidebar';
import SellerNavbar from '@/app/components/seller/sellersnavbar';
import { redirect } from 'next/navigation';
import { getUserFromToken } from '@/lib/auth';
import { checkSeller } from '@/lib/seller-helper';

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromToken();
  
  // Middleware sudah jaga, tapi Layout perlu data user.id
  if (!user) redirect('/auth/login');

  const isSeller = await checkSeller(user.id);

  if (!isSeller) {
    redirect('/user/register-seller');
  }
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SellerSidebar />

      <div className="flex-1 flex flex-col ml-64"> 
        <SellerNavbar />

        {/* pt-0 agar menempel ke navbar, px-4 agar ada sedikit nafas di sisi layar tapi tetap lebar */}
        <main className="p-0 px-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}