'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/admin' },
  { name: 'Orders', href: '/admin/orders' },
  { name: 'Customers', href: '/admin/customers' },
  { name: 'Products', href: '/admin/products' },
  { name: 'Settings', href: '/admin/settings' },
  { name: 'CMS', href: '/admin/cms' },
];

export default function NavAdmin() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 z-50 h-16 w-full border-b border-border bg-background shadow-sm">
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
                      'relative transition-colors',
                      isActive(item.href)
                        ? 'font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'cursor-pointer text-muted-foreground transition-colors hover:text-foreground'
                  )}
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign out
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
