import { getDashboardStats } from '@/lib/dashboard'
import { DashboardStats } from './components/DashboardStats'

export default async function AdminPage() {
  const stats = await getDashboardStats()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here&apos;s an overview of your business.
          </p>
        </div>
      </div>

      <DashboardStats stats={stats} />
    </div>
  )
}
