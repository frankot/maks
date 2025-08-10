import Link from "next/link";
import { Card } from "@/components/ui/card";

const cmsPages = [
  {
    href: "/admin/cms/hero",
    title: "Hero Section",
    description: "Edit landing page hero images and text."
  },
  {
    href: "/admin/cms/gallery",
    title: "Gallery",
    description: "Manage gallery images and layout."
  },
  // Add more CMS subpages here as needed
];


import AdminPageWrapper from "../components/AdminPageWrapper";

export default function CmsIndexPage() {
  return (
    <AdminPageWrapper className="">
      <div className="space-y-2 text-center ">
        <h1 className="text-3xl font-bold">Content Management System</h1>
        <p className="text-gray-600 text-base">
          Manage all landing page, gallery, and featured content for your store. Select a section below to edit.
        </p>
      </div>
      <div className="w-full mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cmsPages.map((page) => (
            <Link key={page.href} href={page.href} className="block">
              <Card className="p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1 text-primary">{page.title}</h2>
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
