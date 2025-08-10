"use client";

import { ReactNode } from "react";
import { Edit } from "lucide-react";

interface CmsLayoutProps {
  children: ReactNode;
  preview: ReactNode;
  title: string;
}

export default function CmsLayout({ children, preview, title }: CmsLayoutProps) {
  return (
    <div className="space-y-6 mt-16">
      <div className="flex overflow-y-auto">
        {/* LEFT SIDE - LIVE PREVIEW (2/3) */}
        <div className="w-2/3 pl-4 bg-white">
          {preview}
        </div>

        {/* RIGHT SIDE - EDITING CONTROLS (1/3) */}
        <div className="w-1/3 pr-4 border-l border-gray-200 bg-gray-50">
          <div className="sticky top-0 z-10 border-b border-stone-800 ml-4 bg-gray-50 p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
          </div>

          <div className="space-y-6 p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
