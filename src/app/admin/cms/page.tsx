import Link from 'next/link';
import { Card } from '@/components/ui/card';

const cmsPages = [
  {
    href: '/admin/cms/hero',
    title: 'Hero Section',
    description: 'Edit landing page hero images and text.',
  },
  {
    href: '/admin/cms/gallery',
    title: 'Gallery',
    description: 'Manage gallery images and layout.',
  },
  // Add more CMS subpages here as needed
];

import AdminPageWrapper from '../components/AdminPageWrapper';

export default function CmsIndexPage() {
  return (
    <AdminPageWrapper className="">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Content Management System</h1>
        <p className="text-base text-gray-600">
          Manage all landing page, gallery, and featured content for your store. Select a section
          below to edit.
        </p>
      </div>
      <div className="mt-6 w-full">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cmsPages.map((page) => (
            <Link key={page.href} href={page.href} className="block">
              <Card className="flex h-full cursor-pointer flex-col justify-between border border-gray-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800">
                <div>
                  <h2 className="text-primary mb-1 text-lg font-semibold">{page.title}</h2>
                  <p className="text-muted-foreground text-sm">{page.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminPageWrapper>
  );
}
