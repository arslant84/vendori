// src/components/layout/app-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, FilePlus, Search, BarChartBig } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/key-in-vendor-data', label: 'Enter Vendor Data', icon: FilePlus },
  { href: '/search-vendor-report', label: 'Search Reports', icon: Search },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" passHref>
              <div className="flex-shrink-0 flex items-center text-primary hover:opacity-80 transition-opacity cursor-pointer">
                <BarChartBig className="h-10 w-10" />
                <span className="ml-3 text-2xl font-headline font-bold">Vendor Insights</span>
              </div>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className={cn(
                      'px-4 py-3 text-md font-medium rounded-md flex items-center gap-2',
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent/50 hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          {/* Mobile menu button can be added here if needed */}
        </div>
      </div>
    </nav>
  );
}
