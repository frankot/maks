"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const cmsNavItems = [
  {
    name: "Landing Page",
    href: "/admin/cms/hero",
  },
  {
    name: "Gallery",
    href: "/admin/cms",
  },
  // Add more sections later
];

export default function NavCms() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/cms") {
      return pathname === "/admin/cms";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="mx-auto w-fit rounded-b-lg border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-12 items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {cmsNavItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive(item.href)
                        ? "bg-gray-100 font-medium text-gray-900"
                        : "text-gray-700 hover:text-gray-900",
                    )}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
