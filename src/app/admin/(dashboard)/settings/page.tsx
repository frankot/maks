import AdminPageWrapper from '../../components/AdminPageWrapper'
import { DangerZone } from './_components/DangerZone'

export default function SettingsPage() {
  return (
    <AdminPageWrapper>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="mx-auto max-w-5xl">
        <DangerZone />
      </div>
    </AdminPageWrapper>
  )
}
