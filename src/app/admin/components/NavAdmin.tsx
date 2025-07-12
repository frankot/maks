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
const navItems = [
  { name: "Home", href: "/admin" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Products", href: "/admin/products" },
  { name: "CMS", href: "/admin/cms" },
  { name: "Settings", href: "/admin/settings" },
];

export default function NavAdmin() {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-gray-700 hover:text-gray-900",
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
