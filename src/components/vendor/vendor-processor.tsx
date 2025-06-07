// src/components/vendor/vendor-processor.tsx
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateVendorReport, type GenerateVendorReportOutput, type GenerateVendorReportInput } from '@/ai/flows/generate-vendor-report';
import { Loader2, FileText, Printer, Download, AlertCircle, CheckCircle, MinusCircle, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

export type VendorInputFields = Omit<GenerateVendorReportInput, 'vendorName'> & { vendorName: string };

export const initialInputState: VendorInputFields = {
  vendorName: '',
  vendorIndustry: '',
  companySize: '',
  keyInformation: '',
  tenderNumber: '',
  tenderTitle: '',
  dateOfFinancialEvaluation: '',
  evaluationValidityDate: '',
  evaluatorNameDepartment: '',
};

// Updated to match the new image format
export const financialCriteriaLegend = [
  { level: 'Green', quantitative: '> 3', altmanZ: '2 – 3', qualitative: '< 2', color: 'bg-green-100 text-green-800', iconColor: 'text-green-500' },
  { level: 'Yellow', quantitative: '>2.6', altmanZ: '1.1 – 2.6', qualitative: '<1.1', color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-500' },
  { level: 'Red', quantitative: 'Low Risk', altmanZ: 'Moderate Risk', qualitative: 'High Risk', color: 'bg-red-100 text-red-800', iconColor: 'text-red-500' },
];


export const VENDOR_BANK_STORAGE_KEY = 'vendorInformationBank';

interface VendorProcessorProps {
  initialData?: VendorInputFields | null;
  onVendorSaved?: (vendors: GenerateVendorReportInput[]) => void; // Callback when vendor is saved
}

export function VendorProcessor({ initialData, onVendorSaved }: VendorProcessorProps) {
  const [formInputs, setFormInputs] = useState<VendorInputFields>(initialData || initialInputState);
  const [report, setReport] = useState<GenerateVendorReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormInputs(initialData);
      setReport(null); // Clear previous report when new initial data is loaded
      setError(null);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    if (!formInputs.vendorName.trim()) {
      setError('Vendor name cannot be empty.');
      toast({
        title: "Validation Error",
        description: "Vendor name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateVendorReport(formInputs);
      setReport(result);
      toast({
        title: "Report Generated",
        description: `Successfully generated report for ${formInputs.vendorName}.`,
      });
    } catch (err) {
      console.error("Error generating report:", err);
      let errorMessage = 'Failed to generate report. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Failed to generate report: ${err.message}. Please check the console for more details.`;
      }
      setError(errorMessage);
      toast({
        title: "Report Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGenerateReport();
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
    
    const storedVendorsRaw = localStorage.getItem(VENDOR_BANK_STORAGE_KEY);
    let currentSavedVendors: GenerateVendorReportInput[] = [];
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
      updatedVendorsList[existingVendorIndex] = { ...formInputs };
      toast({
        title: "Vendor Updated",
        description: `Information for ${formInputs.vendorName} has been updated in the bank.`,
      });
    } else {
      updatedVendorsList = [...currentSavedVendors, { ...formInputs }];
      toast({
        title: "Vendor Saved",
        description: `${formInputs.vendorName} has been added to the bank.`,
      });
    }
    localStorage.setItem(VENDOR_BANK_STORAGE_KEY, JSON.stringify(updatedVendorsList));
    if (onVendorSaved) {
        onVendorSaved(updatedVendorsList);
    }
  };

  const getPrintStyles = () => `
    <style>
      body { font-family: 'Montserrat', sans-serif; font-weight: 300; margin: 0; padding: 20px; color: #333; background-color: #fff; }
      .report-container { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      h1, h2, h3, h4 { color: #3F51B5; margin-top: 0; font-family: 'Montserrat', sans-serif; }
      h1 { font-size: 24px; text-align: center; margin-bottom: 20px; font-weight: 900; text-transform: uppercase; } /* VENDOR DATA BANK FOR FINANCIAL EVALUATION */
      h2 { font-size: 20px; margin-top: 25px; margin-bottom: 10px; color: #000; border-bottom: 1px solid #eee; padding-bottom: 5px; font-weight: 700; text-transform: uppercase; text-align: center;} /* SUMMARY OF VENDOR FINANCIAL EVALUATIONS / FINANCIAL SUB-ELEMENT CRITERIA */
      h3 { font-size: 18px; margin-top: 20px; margin-bottom: 8px; color: #555; font-weight: 700;}
      h4 { font-size: 16px; margin-top: 15px; margin-bottom: 5px; color: #777; font-weight: 700;}
      p, li { line-height: 1.6; font-size: 12px; margin-bottom: 10px; font-weight: 300; }
      .data-bank-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
      .data-bank-table td { border: 1px solid #ddd; padding: 8px; }
      .data-bank-table td:first-child { background-color: #e0e8f0; font-weight: 700; width: 30%; } /* Light blue for labels */
      .summary-eval-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 12px; }
      .summary-eval-table th, .summary-eval-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      .summary-eval-table th { background-color: #333; color: white; font-weight: 700; text-align: center; } /* Dark header for Quantitative, Altman-Z, etc. */
      .summary-eval-table td:first-child { background-color: #e0e8f0; font-weight: 700; } /* Light blue for Score, Band, Risk Category labels */
      .overall-eval-result-text { margin-top: 5px; margin-bottom: 15px; font-weight: 300; font-size: 12px; padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;}
      .risk-level-display { padding: 10px; border-radius: 6px; margin-top: 15px; font-weight: 700; text-align: center; font-size: 14px; }
      .risk-Green { background-color: #e6fffa; color: #00796b; border: 1px solid #b2dfdb; }
      .risk-Yellow { background-color: #fff9c4; color: #fbc02d; border: 1px solid #fff59d; }
      .risk-Red { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
      .detailed-analysis-title { font-size: 20px; margin-top: 25px; margin-bottom: 10px; color: #000; border-bottom: 1px solid #eee; padding-bottom: 5px; font-weight: 700; text-transform: uppercase; text-align: left;}
      .analysis-section { white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #eee; font-weight: 300; font-size: 12px;}
      .criteria-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
      .criteria-table th, .criteria-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      .criteria-table th { background-color: #e0e8f0; color: #333; font-weight: 700; } /* Light blue for headers */
      .criteria-table .level-green { background-color: #a3e6cb; color: #059669; font-weight: 700; } /* Tailwind green-300, green-700 */
      .criteria-table .level-yellow { background-color: #fde047; color: #ca8a04; font-weight: 700; } /* Tailwind yellow-400, yellow-600 */
      .criteria-table .level-red { background-color: #fca5a5; color: #b91c1c; font-weight: 700; } /* Tailwind red-400, red-700 */
      .print-footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .report-container { box-shadow: none; border: none; padding: 0;}
        .no-print { display: none !important; }
        h1 { font-size: 20px; }
        h2 { font-size: 18px; }
        p, li, td, th { font-size: 11px; }
        .data-bank-table td, .summary-eval-table td, .summary-eval-table th, .criteria-table td, .criteria-table th { padding: 6px; }
        .analysis-section { padding: 10px; }
      }
    </style>
  `;
  
  const handlePrintReport = () => {
    if (report) {
      const printContent = `
        <html>
          <head>
            <title>Vendor Financial Evaluation: ${report.nameOfCompanyAssessed}</title>
            ${getPrintStyles()}
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700;900&display=swap" rel="stylesheet">
          </head>
          <body>
            <div class="report-container">
              <h1>VENDOR DATA BANK FOR FINANCIAL EVALUATION</h1>
              <table class="data-bank-table">
                <tr><td>Overall Result</td><td>${report.overallResult}</td></tr>
                <tr><td>Name of Company Assessed</td><td>${report.nameOfCompanyAssessed}</td></tr>
                <tr><td>Tender No.</td><td>${report.tenderNumber}</td></tr>
                <tr><td>Tender Title</td><td>${report.tenderTitle}</td></tr>
                <tr><td>Date of Financial Evaluation</td><td>${report.dateOfFinancialEvaluation}</td></tr>
                <tr><td>Evaluation Validity Date</td><td>${report.evaluationValidityDate}</td></tr>
                <tr><td>Evaluator Name/Department</td><td>${report.evaluatorNameDepartment}</td></tr>
              </table>

              <h2>SUMMARY OF VENDOR FINANCIAL EVALUATIONS</h2>
              <table class="summary-eval-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Quantitative</th>
                    <th>Altman - Z</th>
                    <th>Qualitative</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Score</td>
                    <td>${report.summaryOfEvaluations.quantitativeScore}</td>
                    <td>${report.summaryOfEvaluations.altmanZScore}</td>
                    <td>${report.summaryOfEvaluations.qualitativeScore}</td>
                  </tr>
                  <tr>
                    <td>Band</td>
                    <td>${report.summaryOfEvaluations.quantitativeBand}</td>
                    <td>${report.summaryOfEvaluations.altmanZBand}</td>
                    <td>${report.summaryOfEvaluations.qualitativeBand}</td>
                  </tr>
                  <tr>
                    <td>Risk Category</td>
                    <td>${report.summaryOfEvaluations.quantitativeRiskCategory}</td>
                    <td>${report.summaryOfEvaluations.altmanZRiskCategory}</td>
                    <td>${report.summaryOfEvaluations.qualitativeRiskCategory}</td>
                  </tr>
                </tbody>
              </table>
              <p class="overall-eval-result-text"><strong>Overall Financial Evaluation Result:</strong> ${report.summaryOfEvaluations.overallFinancialEvaluationResult}</p>
              
              <div class="risk-level-display risk-${report.determinedRiskLevel}">Determined Risk Level: ${report.determinedRiskLevel}</div>

              <h3 class="detailed-analysis-title">Detailed Analysis</h3>
              <div class="analysis-section">${report.detailedAnalysis.replace(/\n/g, '<br>')}</div>

              <h2>FINANCIAL SUB-ELEMENT CRITERIA</h2>
              <table class="criteria-table">
                <thead>
                  <tr>
                    <th>Financial Criteria Sub-Element</th>
                    <th>Quantitative:</th>
                    <th>Altman-Z:</th>
                    <th>Qualitative:</th>
                  </tr>
                </thead>
                <tbody>
                  ${financialCriteriaLegend.map(item => `
                    <tr class="level-${item.level.toLowerCase()}">
                      <td>${item.level}</td><td>${item.quantitative}</td><td>${item.altmanZ}</td><td>${item.qualitative}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
              <div class="print-footer">Generated by Vendor Insights AI</div>
            </div>
          </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
      } else {
        toast({
            title: "Print Error",
            description: "Could not open print window. Please check your browser settings.",
            variant: "destructive",
        });
      }
    }
  };

  const handleDownloadReport = () => {
    if (report) {
      let reportText = `VENDOR DATA BANK FOR FINANCIAL EVALUATION\n`;
      reportText += `=========================================\n`;
      reportText += `Overall Result: ${report.overallResult}\n`;
      reportText += `Name of Company Assessed: ${report.nameOfCompanyAssessed}\n`;
      reportText += `Tender No.: ${report.tenderNumber}\n`;
      reportText += `Tender Title: ${report.tenderTitle}\n`;
      reportText += `Date of Financial Evaluation: ${report.dateOfFinancialEvaluation}\n`;
      reportText += `Evaluation Validity Date: ${report.evaluationValidityDate}\n`;
      reportText += `Evaluator Name/Department: ${report.evaluatorNameDepartment}\n\n`;

      reportText += `SUMMARY OF VENDOR FINANCIAL EVALUATIONS\n`;
      reportText += `---------------------------------------\n`;
      reportText += `                     | Quantitative | Altman - Z   | Qualitative\n`;
      reportText += `---------------------|--------------|--------------|-------------\n`;
      reportText += `Score                | ${report.summaryOfEvaluations.quantitativeScore.padEnd(12)} | ${report.summaryOfEvaluations.altmanZScore.padEnd(12)} | ${report.summaryOfEvaluations.qualitativeScore}\n`;
      reportText += `Band                 | ${report.summaryOfEvaluations.quantitativeBand.padEnd(12)} | ${report.summaryOfEvaluations.altmanZBand.padEnd(12)} | ${report.summaryOfEvaluations.qualitativeBand}\n`;
      reportText += `Risk Category        | ${report.summaryOfEvaluations.quantitativeRiskCategory.padEnd(12)} | ${report.summaryOfEvaluations.altmanZRiskCategory.padEnd(12)} | ${report.summaryOfEvaluations.qualitativeRiskCategory}\n\n`;
      reportText += `Overall Financial Evaluation Result: ${report.summaryOfEvaluations.overallFinancialEvaluationResult}\n\n`;

      reportText += `Determined Risk Level: ${report.determinedRiskLevel}\n\n`;
      
      reportText += `Detailed Analysis\n`;
      reportText += `-----------------\n`;
      reportText += `${report.detailedAnalysis}\n\n`;
      
      reportText += `FINANCIAL SUB-ELEMENT CRITERIA\n`;
      reportText += `------------------------------\n`;
      reportText += `Criteria | Quantitative: | Altman-Z:     | Qualitative:\n`;
      financialCriteriaLegend.forEach(item => {
        reportText += `${item.level.padEnd(8)} | ${item.quantitative.padEnd(13)} | ${item.altmanZ.padEnd(13)} | ${item.qualitative}\n`;
      });

      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Vendor_Report_${report.nameOfCompanyAssessed.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({
        title: "Report Downloaded",
        description: `Report for ${report.nameOfCompanyAssessed} downloaded as a TXT file.`,
      });
    }
  };
  
  const RiskIcon = ({ level }: { level: string }) => {
    if (level === 'Green') return <CheckCircle className="mr-2 h-5 w-5 text-green-500" />;
    if (level === 'Yellow') return <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />;
    if (level === 'Red') return <MinusCircle className="mr-2 h-5 w-5 text-red-500" />;
    return null;
  };

  return (
    <>
      <Card className="shadow-xl rounded-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline font-bold flex items-center text-primary">
            <FileText className="mr-3 h-7 w-7" />
            Vendor Evaluation Form
          </CardTitle>
          <CardDescription className="text-md">
            {initialData ? `Editing details for ${initialData.vendorName}. ` : 'Enter new vendor details. '}
            Fill the form to generate or update a financial report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorName" className="text-foreground">Vendor Name <span className="text-destructive">*</span></Label>
                <Input id="vendorName" name="vendorName" type="text" placeholder="e.g., Acme Corp" value={formInputs.vendorName} onChange={handleInputChange} required className="mt-1"/>
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
              <div>
                <Label htmlFor="evaluatorNameDepartment" className="text-foreground">Evaluator Name/Department</Label>
                <Input id="evaluatorNameDepartment" name="evaluatorNameDepartment" type="text" placeholder="e.g., John Doe, Procurement" value={formInputs.evaluatorNameDepartment} onChange={handleInputChange} className="mt-1"/>
              </div>
            </div>
            <div>
              <Label htmlFor="keyInformation" className="text-foreground">Key Information / Specific Requests</Label>
              <Textarea id="keyInformation" name="keyInformation" placeholder="Enter any specific details or areas to focus on..." value={formInputs.keyInformation} onChange={handleInputChange} className="mt-1 min-h-[100px]"/>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" onClick={handleSaveVendor} variant="outline" className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-base py-3">
                <Save className="mr-2 h-5 w-5" />
                {initialData && initialData.vendorName === formInputs.vendorName ? 'Update Vendor Info' : 'Save Vendor Info'}
              </Button>
              <Button type="submit" disabled={isLoading || !formInputs.vendorName.trim()} className="flex-1 bg-primary hover:bg-primary/90 text-base py-3">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-5 w-5" />
                )}
                Generate Report
              </Button>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {isLoading && !report && (
        <Card className="mt-8 w-full shadow-xl animate-pulse rounded-lg">
          <CardHeader><div className="h-8 bg-muted rounded w-3/4"></div></CardHeader>
          <CardContent className="space-y-4 pt-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-6 bg-muted rounded w-full"></div>)}
            <div className="h-6 bg-muted rounded w-5/6"></div>
            <div className="h-20 bg-muted rounded w-full mt-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mt-4"></div>
            {[...Array(2)].map((_, i) => <div key={i+10} className="h-6 bg-muted rounded w-full"></div>)}
          </CardContent>
        </Card>
      )}

      {report && !isLoading && (
        <Card className="mt-8 w-full shadow-xl transition-all duration-500 ease-in-out opacity-100 transform scale-100 rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-headline font-black text-primary text-center uppercase">
              VENDOR FINANCIAL EVALUATION REPORT: {report.nameOfCompanyAssessed}
            </CardTitle>
            <CardDescription className="text-sm text-center">Generated on: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            <section>
              <h3 className="text-lg font-headline font-bold text-primary mb-3 text-center uppercase">VENDOR DATA BANK FOR FINANCIAL EVALUATION</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-slate-300">
                  <tbody>
                    <tr className="border-b border-slate-300"><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold w-1/3">Overall Result</td><td className="p-2">{report.overallResult}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold">Name of Company Assessed</td><td className="p-2">{report.nameOfCompanyAssessed}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold">Tender No.</td><td className="p-2">{report.tenderNumber}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold">Tender Title</td><td className="p-2">{report.tenderTitle}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold">Date of Financial Evaluation</td><td className="p-2">{report.dateOfFinancialEvaluation}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold">Evaluation Validity Date</td><td className="p-2">{report.evaluationValidityDate}</td></tr>
                    <tr><td className="p-2 border-r border-slate-300 bg-sky-100 font-semibold">Evaluator Name/Department</td><td className="p-2">{report.evaluatorNameDepartment}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-headline font-bold text-primary mb-3 text-center uppercase">SUMMARY OF VENDOR FINANCIAL EVALUATIONS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-slate-400">
                  <thead className="bg-slate-700 text-white">
                    <tr>
                      <th className="p-2 border-r border-slate-400"></th>
                      <th className="p-2 border-r border-slate-400">Quantitative</th>
                      <th className="p-2 border-r border-slate-400">Altman - Z</th>
                      <th className="p-2">Qualitative</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-400"><td className="p-2 border-r border-slate-400 bg-sky-100 font-semibold">Score</td><td className="p-2 border-r border-slate-400 text-center">{report.summaryOfEvaluations.quantitativeScore}</td><td className="p-2 border-r border-slate-400 text-center">{report.summaryOfEvaluations.altmanZScore}</td><td className="p-2 text-center">{report.summaryOfEvaluations.qualitativeScore}</td></tr>
                    <tr className="border-b border-slate-400"><td className="p-2 border-r border-slate-400 bg-sky-100 font-semibold">Band</td><td className="p-2 border-r border-slate-400 text-center">{report.summaryOfEvaluations.quantitativeBand}</td><td className="p-2 border-r border-slate-400 text-center">{report.summaryOfEvaluations.altmanZBand}</td><td className="p-2 text-center">{report.summaryOfEvaluations.qualitativeBand}</td></tr>
                    <tr><td className="p-2 border-r border-slate-400 bg-sky-100 font-semibold">Risk Category</td><td className="p-2 border-r border-slate-400 text-center">{report.summaryOfEvaluations.quantitativeRiskCategory}</td><td className="p-2 border-r border-slate-400 text-center">{report.summaryOfEvaluations.altmanZRiskCategory}</td><td className="p-2 text-center">{report.summaryOfEvaluations.qualitativeRiskCategory}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 border border-slate-400 bg-slate-50 rounded-md">
                <h4 className="text-md font-bold text-foreground mb-1">Overall Financial Evaluation Result:</h4>
                <p className="text-foreground text-sm leading-relaxed">{report.summaryOfEvaluations.overallFinancialEvaluationResult}</p>
              </div>
            </section>
            
            <Separator />

            <section>
               <h3 className="text-lg font-headline font-bold text-primary mb-2 text-center uppercase">Determined Financial Risk Level</h3>
              <div className={`flex items-center justify-center p-3 rounded-md border text-md font-semibold ${report.determinedRiskLevel === "Green" ? "bg-green-100 border-green-300 text-green-700" : report.determinedRiskLevel === "Yellow" ? "bg-yellow-100 border-yellow-300 text-yellow-700" : "bg-red-100 border-red-300 text-red-700"}`}>
                <RiskIcon level={report.determinedRiskLevel} />
                <span>{report.determinedRiskLevel}</span>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-headline font-bold text-primary mb-3 text-left uppercase">Detailed Analysis</h3>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm bg-slate-50 p-4 rounded-md border border-slate-200">{report.detailedAnalysis}</p>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-headline font-bold text-primary mb-3 text-center uppercase">FINANCIAL SUB-ELEMENT CRITERIA</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-slate-400">
                  <thead className="bg-sky-100">
                    <tr>
                      <th className="p-2 border-r border-slate-400 font-semibold">Financial Criteria Sub-Element</th>
                      <th className="p-2 border-r border-slate-400 font-semibold">Quantitative:</th>
                      <th className="p-2 border-r border-slate-400 font-semibold">Altman-Z:</th>
                      <th className="p-2 font-semibold">Qualitative:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialCriteriaLegend.map((item) => (
                      <tr key={item.level} className={`${item.color} ${report.determinedRiskLevel === item.level ? 'ring-2 ring-offset-1 ring-primary' : ''}`}>
                        <td className="p-2 border-r border-slate-400 text-center font-semibold">{item.level}</td>
                        <td className="p-2 border-r border-slate-400 text-center">{item.quantitative}</td>
                        <td className="p-2 border-r border-slate-400 text-center">{item.altmanZ}</td>
                        <td className="p-2 text-center">{item.qualitative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button onClick={handleDownloadReport} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Download className="mr-2 h-5 w-5" />
              Download
            </Button>
            <Button onClick={handlePrintReport} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Printer className="mr-2 h-5 w-5" />
              Print
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
