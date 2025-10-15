'use client';

import { ReactNode } from 'react';
import { Edit } from 'lucide-react';

interface CmsLayoutProps {
  children: ReactNode;
  preview: ReactNode;
  title: string;
}

export default function CmsLayout({ children, preview, title }: CmsLayoutProps) {
  return (
    <div className="mt-16 space-y-6">
      <div className="flex overflow-y-auto">
        {/* LEFT SIDE - LIVE PREVIEW (2/3) */}
        <div className="w-2/3 bg-white pl-4">{preview}</div>

        {/* RIGHT SIDE - EDITING CONTROLS (1/3) */}
        <div className="w-1/3 border-l border-gray-200 bg-gray-50 pr-4">
          <div className="sticky top-0 z-10 ml-4 border-b border-stone-800 bg-gray-50 p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
          </div>

          <div className="space-y-6 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
