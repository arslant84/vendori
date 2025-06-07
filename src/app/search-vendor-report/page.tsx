// src/app/search-vendor-report/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { GenerateVendorReportInput } from '@/ai/flows/generate-vendor-report';
import { VendorProcessor, VENDOR_BANK_STORAGE_KEY, type VendorInputFields, initialInputState } from '@/components/vendor/vendor-processor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Trash2, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function SearchVendorReportPage() {
  const [savedVendors, setSavedVendors] = useState<GenerateVendorReportInput[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorInputFields | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedVendors = localStorage.getItem(VENDOR_BANK_STORAGE_KEY);
    if (storedVendors) {
      try {
        const parsedVendors = JSON.parse(storedVendors);
        if (Array.isArray(parsedVendors)) {
          setSavedVendors(parsedVendors);
        }
      } catch (e) {
        console.error("Failed to parse vendors from localStorage", e);
      }
    }
  }, []);

  const handleVendorListUpdate = (updatedVendors: GenerateVendorReportInput[]) => {
    setSavedVendors(updatedVendors);
    // If the currently selected vendor was updated, update it in state too
    if (selectedVendor && updatedVendors.some(v => v.vendorName === selectedVendor.vendorName)) {
        const refreshedVendor = updatedVendors.find(v => v.vendorName === selectedVendor.vendorName);
        if (refreshedVendor) {
            setSelectedVendor(refreshedVendor as VendorInputFields);
        }
    } else if (selectedVendor && !updatedVendors.some(v => v.vendorName === selectedVendor.vendorName)) {
        // If the selected vendor was removed
        setSelectedVendor(null);
    }
  };

  const handleLoadVendor = (vendor: GenerateVendorReportInput) => {
    setSelectedVendor({ ...initialInputState, ...vendor }); // Ensure all fields are present
    toast({
      title: "Vendor Loaded",
      description: `Information for ${vendor.vendorName} loaded for processing.`,
    });
  };

  const handleRemoveVendor = (vendorNameToRemove: string) => {
    const updatedVendors = savedVendors.filter(v => v.vendorName !== vendorNameToRemove);
    setSavedVendors(updatedVendors);
    localStorage.setItem(VENDOR_BANK_STORAGE_KEY, JSON.stringify(updatedVendors));
    toast({
      title: "Vendor Removed",
      description: `${vendorNameToRemove} has been removed from the bank.`,
      variant: "destructive"
    });
    if (selectedVendor && selectedVendor.vendorName === vendorNameToRemove) {
      setSelectedVendor(null);
    }
  };

  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) {
      return savedVendors;
    }
    return savedVendors.filter(vendor =>
      vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [savedVendors, searchTerm]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-headline font-black text-primary flex items-center justify-center">
          <Search className="mr-4 h-12 w-12" />
          Search Vendor Reports
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Find existing vendors, load their data, and generate or update financial reports.
        </p>
      </header>

      <div className="w-full max-w-3xl space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline font-bold flex items-center text-primary">
              <Users className="mr-3 h-7 w-7" />
              Vendor Information Bank
            </CardTitle>
            <CardDescription className="text-md">Search, load, or remove saved vendor information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by vendor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
            </div>
            {filteredVendors.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-md p-2">
                {filteredVendors.map(vendor => (
                  <li key={vendor.vendorName} className="flex items-center justify-between p-3 bg-background hover:bg-muted/50 rounded-md shadow-sm border">
                    <span className="font-medium text-foreground truncate pr-2" title={vendor.vendorName}>{vendor.vendorName}</span>
                    <div className="flex-shrink-0 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleLoadVendor(vendor)}>
                        <Edit className="mr-1 h-4 w-4" /> Load & Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveVendor(vendor.vendorName)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {savedVendors.length === 0 ? "No vendors saved yet. Add some via the 'Enter Vendor Data' page." : "No vendors match your search."}
              </p>
            )}
          </CardContent>
        </Card>

        {selectedVendor && (
          <div className="mt-8 w-full">
             <h2 className="text-3xl font-headline font-black text-primary mb-6 text-center">Process Selected Vendor</h2>
            <VendorProcessor initialData={selectedVendor} onVendorSaved={handleVendorListUpdate} />
          </div>
        )}
      </div>
    </div>
  );
}
