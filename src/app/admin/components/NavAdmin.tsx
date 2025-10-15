'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/admin' },
  { name: 'Orders', href: '/admin/orders' },
  { name: 'Customers', href: '/admin/customers' },
  { name: 'Products', href: '/admin/products' },
  { name: 'Settings', href: '/admin/settings' },
];

const cmsItems = [
  { name: 'Landing Page', href: '/admin/cms/hero' },
  { name: 'Gallery', href: '/admin/cms' },
];

export default function NavAdmin() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isCmsActive = () => {
    return pathname.startsWith('/admin/cms');
  };

  return (
    <nav className="fixed top-0 z-50 h-16 w-full border-b border-gray-200 bg-white shadow-sm">
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
                      isActive(item.href)
                        ? 'bg-gray-100 font-medium text-gray-900'
                        : 'text-gray-700 hover:text-gray-900'
                    )}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {/* CMS Dropdown */}
              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'flex items-center space-x-1',
                        isCmsActive()
                          ? 'bg-gray-100 font-medium text-gray-900'
                          : 'text-gray-700 hover:text-gray-900'
                      )}
                    >
                      <span>CMS</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {cmsItems.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="w-full">
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
