import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import Navbar from '@/app/components/publicnavbar'
import { getUserFromToken } from '@/lib/auth'

export default async function UserLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getUserFromToken()

  // Jika sudah login, jangan boleh lihat public layout
  if (user) {
    redirect('/user/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
        {children}
      </main>
    </div>
  )
}
