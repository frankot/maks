import HeroCms from "./hero/page";
import NavCms from "./_components/NavCms";
import { ReactNode } from "react";

export default function CmsPage({ children }: { children: ReactNode }) {
  return (
    <div className="-mt-9 min-h-screen bg-gray-50">
      <NavCms />
      <main>
        {children}
      </main>
    </div>
  );
}
