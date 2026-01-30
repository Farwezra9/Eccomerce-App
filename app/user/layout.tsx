import Navbar from '@/app/components/user/usersnavbar';
import Footer from '@/app/components/admin/footer';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}