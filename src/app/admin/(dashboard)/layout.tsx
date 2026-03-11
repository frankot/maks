import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import NavAdmin from '../components/NavAdmin'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavAdmin />
      <main>
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
