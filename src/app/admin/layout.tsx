import NavAdmin from './components/NavAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavAdmin />
      <main>
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
