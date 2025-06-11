
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppNavigation } from '@/components/layout/app-navigation';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weights: [300, 700, 900],
  variable: '--font-montserrat',
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
      <head>
        {/* Google Font links for Montserrat are now handled by next/font */}
      </head>
      <body className={`${montserrat.className} font-body font-light antialiased bg-background text-foreground`}>
          <AppNavigation />
          <main>{children}</main>
          <Toaster />
      </body>
    </html>
  );
}
