
// src/app/key-in-vendor-data/page.tsx
'use client';

import { VendorProcessor } from '@/components/vendor/vendor-processor';
import { FilePlus } from 'lucide-react';

export default function KeyInVendorDataPage() {
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
