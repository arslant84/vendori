
// src/components/vendor/vendor-processor.tsx
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

// Matches the structure in the image for data entry
export interface VendorInputFields {
  vendorName: string;
  vendorIndustry?: string;
  companySize?: string;
  tenderNumber?: string;
  tenderTitle?: string;
  dateOfFinancialEvaluation?: string;
  evaluationValidityDate?: string;
  evaluatorNameDepartment?: string;
  
  overallResult?: string; // From "VENDOR DATA BANK FOR FINANCIAL EVALUATION"

  quantitativeScore?: string;
  quantitativeBand?: string;
  quantitativeRiskCategory?: string;

  altmanZScore?: string;
  altmanZBand?: string;
  altmanZRiskCategory?: string;

  qualitativeScore?: string;
  qualitativeBand?: string;
  qualitativeRiskCategory?: string;

  overallFinancialEvaluationResult?: string; // From "SUMMARY OF VENDOR FINANCIAL EVALUATIONS"
  
  keyInformation?: string; // General notes or other details
}

export const initialInputState: VendorInputFields = {
  vendorName: '',
  vendorIndustry: '',
  companySize: '',
  tenderNumber: '',
  tenderTitle: '',
  dateOfFinancialEvaluation: '',
  evaluationValidityDate: '',
  evaluatorNameDepartment: '',
  overallResult: '',
  quantitativeScore: '',
  quantitativeBand: '',
  quantitativeRiskCategory: '',
  altmanZScore: '',
  altmanZBand: '',
  altmanZRiskCategory: '',
  qualitativeScore: '',
  qualitativeBand: '',
  qualitativeRiskCategory: '',
  overallFinancialEvaluationResult: '',
  keyInformation: '',
};

export const VENDOR_BANK_STORAGE_KEY = 'vendorInformationBank_manual'; // Changed key to avoid conflicts

interface VendorProcessorProps {
  initialData?: VendorInputFields | null;
  onVendorSaved?: (vendors: VendorInputFields[]) => void;
}

export function VendorProcessor({ initialData, onVendorSaved }: VendorProcessorProps) {
  const [formInputs, setFormInputs] = useState<VendorInputFields>(initialData || initialInputState);
  const [isLoading, setIsLoading] = useState(false); // Kept for potential future async ops like API save
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormInputs(initialData);
    } else {
      setFormInputs(initialInputState); // Reset to initial if no data provided
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveVendor = () => {
    if (!formInputs.vendorName.trim()) {
      toast({
        title: "Cannot Save Vendor",
        description: "Vendor name is required to save information.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const storedVendorsRaw = localStorage.getItem(VENDOR_BANK_STORAGE_KEY);
    let currentSavedVendors: VendorInputFields[] = [];
    if (storedVendorsRaw) {
        try {
            currentSavedVendors = JSON.parse(storedVendorsRaw);
            if (!Array.isArray(currentSavedVendors)) currentSavedVendors = [];
        } catch (e) {
            console.error("Error parsing vendors from localStorage for saving:", e);
            currentSavedVendors = [];
        }
    }

    const existingVendorIndex = currentSavedVendors.findIndex(v => v.vendorName === formInputs.vendorName);
    let updatedVendorsList;

    if (existingVendorIndex > -1) {
      updatedVendorsList = [...currentSavedVendors];
      updatedVendorsList[existingVendorIndex] = { ...formInputs }; // Update existing
      toast({
        title: "Vendor Updated",
        description: `Information for ${formInputs.vendorName} has been updated.`,
      });
    } else {
      updatedVendorsList = [...currentSavedVendors, { ...formInputs }]; // Add new
      toast({
        title: "Vendor Saved",
        description: `${formInputs.vendorName} has been added to the data bank.`,
      });
    }
    localStorage.setItem(VENDOR_BANK_STORAGE_KEY, JSON.stringify(updatedVendorsList));
    if (onVendorSaved) {
        onVendorSaved(updatedVendorsList);
    }
    setIsLoading(false);
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSaveVendor();
  };


  return (
    <Card className="shadow-xl rounded-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline font-bold flex items-center text-primary">
          <FileText className="mr-3 h-7 w-7" />
          Vendor Evaluation Data Entry
        </CardTitle>
        <CardDescription className="text-md">
          {initialData ? `Editing details for ${initialData.vendorName}. ` : 'Enter new vendor evaluation details. '}
          Fill the form to save or update vendor information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <section className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Vendor Data Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorName" className="text-foreground">Vendor Name <span className="text-destructive">*</span></Label>
                <Input id="vendorName" name="vendorName" type="text" placeholder="e.g., Acme Corp" value={formInputs.vendorName} onChange={handleInputChange} required className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="overallResult" className="text-foreground">Overall Result (Data Bank)</Label>
                <Input id="overallResult" name="overallResult" type="text" placeholder="e.g., Favorable, High Risk" value={formInputs.overallResult} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="vendorIndustry" className="text-foreground">Vendor Industry</Label>
                <Input id="vendorIndustry" name="vendorIndustry" type="text" placeholder="e.g., Manufacturing" value={formInputs.vendorIndustry} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="companySize" className="text-foreground">Company Size</Label>
                <Input id="companySize" name="companySize" type="text" placeholder="e.g., 500 employees or Large" value={formInputs.companySize} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="tenderNumber" className="text-foreground">Tender Number</Label>
                <Input id="tenderNumber" name="tenderNumber" type="text" placeholder="e.g., TND-2024-001" value={formInputs.tenderNumber} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="tenderTitle" className="text-foreground">Tender Title</Label>
                <Input id="tenderTitle" name="tenderTitle" type="text" placeholder="e.g., Supply of Office Equipment" value={formInputs.tenderTitle} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="dateOfFinancialEvaluation" className="text-foreground">Date of Financial Evaluation</Label>
                <Input id="dateOfFinancialEvaluation" name="dateOfFinancialEvaluation" type="date" value={formInputs.dateOfFinancialEvaluation} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="evaluationValidityDate" className="text-foreground">Evaluation Validity Date</Label>
                <Input id="evaluationValidityDate" name="evaluationValidityDate" type="date" value={formInputs.evaluationValidityDate} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="evaluatorNameDepartment" className="text-foreground">Evaluator Name/Department</Label>
                <Input id="evaluatorNameDepartment" name="evaluatorNameDepartment" type="text" placeholder="e.g., John Doe, Procurement" value={formInputs.evaluatorNameDepartment} onChange={handleInputChange} className="mt-1"/>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Summary of Vendor Financial Evaluations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <h4 className="md:col-span-3 text-md font-medium text-muted-foreground">Quantitative</h4>
              <div>
                <Label htmlFor="quantitativeScore">Score</Label>
                <Input id="quantitativeScore" name="quantitativeScore" value={formInputs.quantitativeScore} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="quantitativeBand">Band</Label>
                <Input id="quantitativeBand" name="quantitativeBand" value={formInputs.quantitativeBand} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="quantitativeRiskCategory">Risk Category</Label>
                <Input id="quantitativeRiskCategory" name="quantitativeRiskCategory" value={formInputs.quantitativeRiskCategory} onChange={handleInputChange} className="mt-1"/>
              </div>

              <Separator className="md:col-span-3 my-2"/>
              <h4 className="md:col-span-3 text-md font-medium text-muted-foreground">Altman - Z</h4>
              <div>
                <Label htmlFor="altmanZScore">Score</Label>
                <Input id="altmanZScore" name="altmanZScore" value={formInputs.altmanZScore} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="altmanZBand">Band</Label>
                <Input id="altmanZBand" name="altmanZBand" value={formInputs.altmanZBand} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="altmanZRiskCategory">Risk Category</Label>
                <Input id="altmanZRiskCategory" name="altmanZRiskCategory" value={formInputs.altmanZRiskCategory} onChange={handleInputChange} className="mt-1"/>
              </div>

              <Separator className="md:col-span-3 my-2"/>
              <h4 className="md:col-span-3 text-md font-medium text-muted-foreground">Qualitative</h4>
              <div>
                <Label htmlFor="qualitativeScore">Score</Label>
                <Input id="qualitativeScore" name="qualitativeScore" value={formInputs.qualitativeScore} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="qualitativeBand">Band</Label>
                <Input id="qualitativeBand" name="qualitativeBand" value={formInputs.qualitativeBand} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="qualitativeRiskCategory">Risk Category</Label>
                <Input id="qualitativeRiskCategory" name="qualitativeRiskCategory" value={formInputs.qualitativeRiskCategory} onChange={handleInputChange} className="mt-1"/>
              </div>
            </div>
            
            <Separator className="my-4"/>
            <div>
              <Label htmlFor="overallFinancialEvaluationResult" className="text-foreground">Overall Financial Evaluation Result</Label>
              <Textarea id="overallFinancialEvaluationResult" name="overallFinancialEvaluationResult" placeholder="Enter overall financial evaluation summary..." value={formInputs.overallFinancialEvaluationResult} onChange={handleInputChange} className="mt-1 min-h-[100px]"/>
            </div>
          </section>
          
          <Separator />

          <section className="space-y-4 p-4 border rounded-md">
             <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Additional Notes</h3>
            <div>
              <Label htmlFor="keyInformation" className="text-foreground">Key Information / Other Notes</Label>
              <Textarea id="keyInformation" name="keyInformation" placeholder="Enter any other specific details or notes..." value={formInputs.keyInformation} onChange={handleInputChange} className="mt-1 min-h-[100px]"/>
            </div>
          </section>
            
          <Button type="submit" disabled={isLoading || !formInputs.vendorName.trim()} className="w-full bg-primary hover:bg-primary/90 text-base py-3">
            <Save className="mr-2 h-5 w-5" />
            {initialData ? 'Update Vendor Data' : 'Save Vendor Data'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-6 border-t mt-6">
        <p className="text-xs text-muted-foreground">All entered data will be saved locally in your browser.</p>
      </CardFooter>
    </Card>
  );
}
