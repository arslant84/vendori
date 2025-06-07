'use client';

import { useState } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateVendorReport, type GenerateVendorReportOutput } from '@/ai/flows/generate-vendor-report';
import { Loader2, FileText, Printer, Download } from 'lucide-react';

export default function VendorInsightsPage() {
  const [vendorName, setVendorName] = useState('');
  const [report, setReport] = useState<GenerateVendorReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedVendorName, setSubmittedVendorName] = useState('');


  const handleGenerateReport = async () => {
    if (!vendorName.trim()) {
      setError('Vendor name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);
    setSubmittedVendorName(vendorName); // Store the name used for the report
    try {
      const result = await generateVendorReport({ vendorName });
      setReport(result);
    } catch (err) {
      console.error("Error generating report:", err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGenerateReport();
  };

  const handlePrintReport = () => {
    if (report && submittedVendorName) {
      const printContent = `
        <html>
          <head>
            <title>Vendor Report: ${submittedVendorName}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 20px; color: #333; }
              h1 { color: #3F51B5; font-size: 24px; }
              h2 { color: #009688; margin-top: 20px; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px;}
              p { white-space: pre-wrap; line-height: 1.6; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>Vendor Report: ${submittedVendorName}</h1>
            <h2>Summary</h2>
            <p>${report.summary}</p>
          </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus(); // Required for some browsers
        printWindow.print();
      } else {
        alert('Could not open print window. Please check your browser settings.');
      }
    }
  };

  const handleDownloadReport = () => {
    if (report && submittedVendorName) {
      const reportText = `Vendor Report: ${submittedVendorName}\n\nSummary:\n${report.summary}`;
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Vendor_Report_${submittedVendorName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-headline font-bold text-primary">Vendor Insights</h1>
        <p className="text-muted-foreground mt-2 text-lg">AI-Powered Vendor Analysis</p>
      </header>

      <Card className="w-full max-w-2xl shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center text-primary">
            <FileText className="mr-3 h-7 w-7" />
            Generate Vendor Report
          </CardTitle>
          <CardDescription className="text-md">Enter the vendor name to get an AI-generated financial summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter vendor name (e.g., Acme Corp)"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="flex-grow text-base"
                aria-label="Vendor Name"
              />
              <Button type="submit" disabled={isLoading || !vendorName.trim()} className="bg-primary hover:bg-primary/90 text-base px-6 py-2 h-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-5 w-5" />
                )}
                Generate
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 w-full max-w-2xl">
          <Card className="shadow-xl animate-pulse rounded-lg">
            <CardHeader>
              <div className="h-7 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        </div>
      )}

      {report && !isLoading && (
        <Card className="mt-8 w-full max-w-2xl shadow-xl transition-all duration-500 ease-in-out opacity-100 transform scale-100 rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">
              Report for: <span className="font-bold">{submittedVendorName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <h3 className="text-xl font-semibold text-accent mb-3 font-headline">Summary</h3>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">{report.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-6">
            <Button onClick={handleDownloadReport} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-base px-4 py-2 h-auto">
              <Download className="mr-2 h-5 w-5" />
              Download
            </Button>
            <Button onClick={handlePrintReport} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-base px-4 py-2 h-auto">
              <Printer className="mr-2 h-5 w-5" />
              Print
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
