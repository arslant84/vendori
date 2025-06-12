
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppNavigation } from '@/components/layout/app-navigation';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '700', '900'] 
});

export const metadata: Metadata = {
  title: 'Vendor Insights',
  description: 'Vendor Evaluation Data Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body className={`${montserrat.className} font-body font-light antialiased bg-background text-foreground flex flex-col min-h-screen`}>
          <AppNavigation />
          <main className="flex flex-col flex-grow">{children}</main>
          <Toaster />
      </body>
    </html>
  );
}

