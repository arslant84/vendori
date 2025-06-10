import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppNavigation } from '@/components/layout/app-navigation';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700;900&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body font-light antialiased bg-background text-foreground">
          <AppNavigation />
          <main>{children}</main>
          <Toaster />
      </body>
    </html>
  );
}
