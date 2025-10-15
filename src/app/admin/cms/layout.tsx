import { ReactNode } from 'react';

export default function CmsPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
