
import { ReactNode } from "react";

export default function CmsPage({ children }: { children: ReactNode }) {
  return (
    <div className="-mt-9 min-h-screen bg-gray-50">

      <main>
        {children}
      </main>
    </div>
  );
}
