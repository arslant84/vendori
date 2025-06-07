
// src/components/layout/app-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, FilePlus, Search, BarChartBig, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const publicNavItems = [
  { href: '/', label: 'Home', icon: Home },
];

const protectedNavItems = [
  { href: '/key-in-vendor-data', label: 'Enter Vendor Data', icon: FilePlus },
  { href: '/search-vendor-report', label: 'Search Reports', icon: Search },
];

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
    }
  };

  const navItems = user ? [...publicNavItems, ...protectedNavItems] : publicNavItems;

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
          <div className="hidden md:flex items-center">
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
            <div className="ml-6">
              {user ? (
                <Button onClick={handleLogout} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              ) : (
                <Link href="/login" passHref>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
          {/* Mobile menu button can be added here if needed for responsiveness */}
        </div>
      </div>
    </nav>
  );
}
