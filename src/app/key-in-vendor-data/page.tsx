
// src/app/key-in-vendor-data/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { VendorProcessor } from '@/components/vendor/vendor-processor';
import { FilePlus, Loader2 } from 'lucide-react';

export default function KeyInVendorDataPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/key-in-vendor-data');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-headline font-black text-primary flex items-center justify-center">
          <FilePlus className="mr-4 h-12 w-12" />
          Enter New Vendor Information
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Provide the details below to generate a financial evaluation report for a new vendor.
        </p>
      </header>

      <div className="w-full max-w-3xl space-y-8">
        <VendorProcessor />
      </div>
    </div>
  );
}
