// src/app/search-vendor-report/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { VendorInputFields } from '@/components/vendor/vendor-processor';
import { initialInputState } from '@/components/vendor/vendor-processor'; // Keep this static import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Trash2, Edit, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAllVendorsDb, removeVendorDb } from '@/lib/database';
import dynamic from 'next/dynamic';

const DynamicVendorProcessor = dynamic(() =>
  import('@/components/vendor/vendor-processor').then(mod => mod.VendorProcessor),
  {
    loading: () => (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading editor...</p>
      </div>
    ),
    ssr: false, // VendorProcessor relies on client-side DB and export features
  }
);

export default function SearchVendorReportPage() {
  const [allVendors, setAllVendors] = useState<VendorInputFields[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorInputFields | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const { toast } = useToast();
  
  const fetchVendors = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const vendorsFromDb = await getAllVendorsDb();
      setAllVendors(vendorsFromDb);
    } catch (e) {
      console.error("Failed to fetch vendors from DB", e);
      toast({
        title: "Error Loading Vendors",
        description: "Could not retrieve vendor data from the database.",
        variant: "destructive"
      });
      setAllVendors([]); // Ensure it's an array even on error
    } finally {
      setIsLoadingList(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleVendorListUpdate = () => {
    fetchVendors();
    if (selectedVendor) {
      const updatedVendor = allVendors.find(v => v.vendorName === selectedVendor.vendorName);
      if (updatedVendor) {
         // setSelectedVendor(updatedVendor); // Potentially refresh with latest data if needed
      } else {
        setSelectedVendor(null); 
      }
    }
  };

  const handleLoadVendor = (vendor: VendorInputFields) => {
    setSelectedVendor({ ...initialInputState, ...vendor }); 
    toast({
      title: "Vendor Data Loaded",
      description: `Information for ${vendor.vendorName} loaded for viewing/editing.`,
    });
  };

  const handleRemoveVendor = async (vendorNameToRemove: string) => {
    try {
      await removeVendorDb(vendorNameToRemove);
      toast({
        title: "Vendor Removed",
        description: `${vendorNameToRemove} has been removed from the database.`,
        variant: "destructive"
      });
      setAllVendors(prev => prev.filter(v => v.vendorName !== vendorNameToRemove));
      if (selectedVendor && selectedVendor.vendorName === vendorNameToRemove) {
        setSelectedVendor(null); 
      }
    } catch (error) {
      console.error("Failed to remove vendor from DB:", error);
      toast({
        title: "Removal Failed",
        description: `Could not remove ${vendorNameToRemove}. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    }
  };

  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) {
      return allVendors;
    }
    return allVendors.filter(vendor =>
      vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVendors, searchTerm]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-headline font-black text-primary flex items-center justify-center">
          <Search className="mr-4 h-12 w-12" />
          Search Vendor Evaluations
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Find existing vendors and load their evaluation data for review or updates.
        </p>
      </header>

      <div className="w-full max-w-3xl space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline font-bold flex items-center text-primary">
              <Users className="mr-3 h-7 w-7" />
              Vendor Data Bank
            </CardTitle>
            <CardDescription className="text-md">Search, load, or remove saved vendor evaluation data from the database.</CardDescription>
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
            {isLoadingList ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading vendors...</p>
              </div>
            ) : filteredVendors.length > 0 ? (
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
                {allVendors.length === 0 ? "No vendors saved in the database yet. Add some via the 'Enter Vendor Evaluation' page." : "No vendors match your search."}
              </p>
            )}
          </CardContent>
        </Card>

        {selectedVendor && (
          <div className="mt-8 w-full">
             <h2 className="text-3xl font-headline font-black text-primary mb-6 text-center">View/Edit Vendor Evaluation</h2>
            <DynamicVendorProcessor initialData={selectedVendor} onVendorSaved={handleVendorListUpdate} />
          </div>
        )}
        {!selectedVendor && !isLoadingList && (
          <div className="mt-8 w-full text-center text-muted-foreground">
            <p>Select a vendor from the list above to view or edit their details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
