// src/components/vendor/vendor-processor.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Save, FileText, Download, Printer, FileType, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { saveVendorDb } from '@/lib/database';


export interface VendorInputFields {
  vendorName: string;
  vendorIndustry?: string;
  companySize?: string;
  tenderNumber?: string;
  tenderTitle?: string;
  dateOfFinancialEvaluation?: string;
  evaluationValidityDate?: string;
  evaluatorNameDepartment?: string;
  overallResult?: string;
  quantitativeScore?: string;
  quantitativeBand?: string;
  quantitativeRiskCategory?: string;
  altmanZScore?: string;
  altmanZBand?: string;
  altmanZRiskCategory?: string;
  qualitativeScore?: string;
  qualitativeBand?: string;
  qualitativeRiskCategory?: string;
  overallFinancialEvaluationResult?: string;
  keyInformation?: string;
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

interface VendorProcessorProps {
  initialData?: VendorInputFields | null;
  onVendorSaved?: () => void; 
}

export function VendorProcessor({ initialData, onVendorSaved }: VendorProcessorProps) {
  const [formInputs, setFormInputs] = useState<VendorInputFields>(initialData || initialInputState);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormInputs(initialData);
    } else {
      setFormInputs(initialInputState);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveVendor = async () => {
    if (!formInputs.vendorName.trim()) {
      toast({
        title: "Cannot Save Vendor",
        description: "Vendor name is required to save information.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await saveVendorDb({ ...formInputs });
      toast({
        title: initialData && initialData.vendorName === formInputs.vendorName ? "Vendor Updated" : "Vendor Saved",
        description: `Information for ${formInputs.vendorName} has been saved to the database.`,
      });
      if (onVendorSaved) {
        onVendorSaved(); 
      }
    } catch (error) {
      console.error("Failed to save vendor to DB:", error);
      toast({
        title: "Save Failed",
        description: `Could not save vendor data. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSaveVendor();
  };

  const financialCriteriaLegend = {
    "Green (Low Risk)": "Quantitative > 3, Altman-Z 2 – 3, Qualitative < 2.",
    "Yellow (Moderate Risk)": "Quantitative >2.6, Altman-Z 1.1 – 2.6, Qualitative <1.1.",
    "Red (High Risk)": "Quantitative assessed as 'Low Risk', Altman-Z as 'Moderate Risk', AND Qualitative as 'High Risk'. A 'High Risk' qualitative assessment is a strong indicator for Red."
  };

  const handleDownloadReport = async (format: 'txt' | 'pdf' | 'excel' | 'word') => {
    const { vendorName, ...restOfData } = { ...formInputs, detailedAnalysis: formInputs.keyInformation }; 

    const dataBankHeader = "VENDOR DATA BANK FOR FINANCIAL EVALUATION";
    const summaryHeader = "SUMMARY OF VENDOR FINANCIAL EVALUATIONS";
    const criteriaHeader = "FINANCIAL SUB-ELEMENT CRITERIA";
    const detailedAnalysisHeader = "DETAILED ANALYSIS";
    
    const dataBankFields = [
      { label: "Name of Company Assessed", value: restOfData.vendorName },
      { label: "Overall Result", value: restOfData.overallResult },
      { label: "Tender Number", value: restOfData.tenderNumber },
      { label: "Tender Title", value: restOfData.tenderTitle },
      { label: "Date of Financial Evaluation", value: restOfData.dateOfFinancialEvaluation },
      { label: "Evaluation Validity Date", value: restOfData.evaluationValidityDate },
      { label: "Evaluator Name/Department", value: restOfData.evaluatorNameDepartment },
    ];

    const summaryTableData = [
        ["Category", "Quantitative", "Altman - Z", "Qualitative", "Overall Financial Evaluation Result"],
        ["Score", restOfData.quantitativeScore, restOfData.altmanZScore, restOfData.qualitativeScore, ""],
        ["Band", restOfData.quantitativeBand, restOfData.altmanZBand, restOfData.qualitativeBand, ""],
        ["Risk Category", restOfData.quantitativeRiskCategory, restOfData.altmanZRiskCategory, restOfData.qualitativeRiskCategory, ""],
    ];
    
    setIsExporting(true);
    try {
      if (format === 'txt') {
          const { saveAs } = await import('file-saver');
          let content = `${dataBankHeader}\n`;
          content += "--------------------------------------------------\n";
          dataBankFields.forEach(field => content += `${field.label}: ${field.value || 'N/A'}\n`);
          
          content += `\n${summaryHeader}\n`;
          content += "--------------------------------------------------\n";
          content += `Quantitative: Score: ${restOfData.quantitativeScore || 'N/A'}, Band: ${restOfData.quantitativeBand || 'N/A'}, Risk: ${restOfData.quantitativeRiskCategory || 'N/A'}\n`;
          content += `Altman - Z: Score: ${restOfData.altmanZScore || 'N/A'}, Band: ${restOfData.altmanZBand || 'N/A'}, Risk: ${restOfData.altmanZRiskCategory || 'N/A'}\n`;
          content += `Qualitative: Score: ${restOfData.qualitativeScore || 'N/A'}, Band: ${restOfData.qualitativeBand || 'N/A'}, Risk: ${restOfData.qualitativeRiskCategory || 'N/A'}\n`;
          content += `Overall Financial Evaluation Result: ${restOfData.overallFinancialEvaluationResult || 'N/A'}\n`;

          content += `\n${detailedAnalysisHeader}\n--------------------------------------------------\n${formInputs.keyInformation || 'N/A'}\n`;

          content += `\n${criteriaHeader}\n--------------------------------------------------\n`;
          Object.entries(financialCriteriaLegend).forEach(([level, criteria]) => content += `${level}: ${criteria}\n`);

          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, `${vendorName}_Evaluation_Report.txt`);
      } else if (format === 'pdf') {
          const { default: jsPDF } = await import('jspdf');
          const autoTable = (await import('jspdf-autotable')).default; // Extends jsPDF instance

          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text(vendorName + " - Financial Evaluation Report", 14, 22);
          doc.setFontSize(11);
          doc.setTextColor(100);

          let yPos = 35;
          doc.setFontSize(14);
          doc.text(dataBankHeader, 14, yPos);
          yPos += 8;
          doc.setFontSize(10);
          autoTable(doc, { // Use the imported autoTable function
              startY: yPos,
              head: [['Field', 'Value']],
              body: dataBankFields.map(f => [f.label, f.value || 'N/A']),
              theme: 'striped',
              styles: { fontSize: 9 },
              headStyles: { fillColor: [38, 50, 56] }, 
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;

          doc.setFontSize(14);
          doc.text(summaryHeader, 14, yPos);
          yPos += 8;
          doc.setFontSize(10);
          autoTable(doc, { // Use the imported autoTable function
              startY: yPos,
              head: [['', 'Quantitative', 'Altman - Z', 'Qualitative']],
              body: [
                  ['Score', restOfData.quantitativeScore, restOfData.altmanZScore, restOfData.qualitativeScore],
                  ['Band', restOfData.quantitativeBand, restOfData.altmanZBand, restOfData.qualitativeBand],
                  ['Risk Category', restOfData.quantitativeRiskCategory, restOfData.altmanZRiskCategory, restOfData.qualitativeRiskCategory],
              ],
              theme: 'grid',
              styles: { fontSize: 9 },
              didDrawCell: (data: any) => {
                  if (data.column.index === 3 && data.section === 'head') { 
                      doc.setFillColor(38, 50, 56); 
                      doc.rect(data.cell.x + data.cell.width, data.cell.y, data.cell.width / 2, data.cell.height, 'F'); 
                      doc.setTextColor(255, 255, 255);
                      doc.text("Overall Evaluation", data.cell.x + data.cell.width + 5, data.cell.y + data.row.height / 1.5);
                  }
                  if (data.column.index === 3 && data.section === 'body') { 
                       if (data.row.index === 0) { 
                          const text = restOfData.overallFinancialEvaluationResult || 'N/A';
                          const splitText = doc.splitTextToSize(text, data.cell.width / 2 - 10); 
                          const textHeight = splitText.length * (doc.getFontSize() * doc.getLineHeightFactor());
                          const requiredCellHeight = Math.max(data.row.height * 3, textHeight + 10); 
                          
                          doc.setFillColor(255, 255, 255); 
                          doc.setDrawColor(200, 200, 200); 
                          doc.rect(data.cell.x + data.cell.width, data.cell.y, data.cell.width / 2, requiredCellHeight, 'FD');
                          doc.setTextColor(0,0,0);
                          doc.text(splitText, data.cell.x + data.cell.width + 5, data.cell.y + 5);
                      }
                  }
              },
               margin: { right: 80 } 
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;

          doc.setFontSize(14);
          doc.text(detailedAnalysisHeader, 14, yPos);
          yPos += 8;
          doc.setFontSize(10);
          const splitDetailedAnalysis = doc.splitTextToSize(formInputs.keyInformation || 'N/A', 180);
          doc.text(splitDetailedAnalysis, 14, yPos);
          yPos += splitDetailedAnalysis.length * (doc.getFontSize() * 0.5) + 10; 

          doc.setFontSize(14);
          doc.text(criteriaHeader, 14, yPos);
          yPos += 8;
          doc.setFontSize(10);
          autoTable(doc, { // Use the imported autoTable function
              startY: yPos,
              head: [['Risk Level', 'Criteria']],
              body: Object.entries(financialCriteriaLegend).map(([level, criteria]) => [level, criteria]),
              theme: 'striped',
              styles: { fontSize: 9 },
          });

          doc.save(`${vendorName}_Evaluation_Report.pdf`);

      } else if (format === 'excel') {
          const XLSX = await import('xlsx');
          const wb = XLSX.utils.book_new();
          
          const wsDataBank = [
              [dataBankHeader],
              ...dataBankFields.map(f => [f.label, f.value || 'N/A'])
          ];
          const ws1 = XLSX.utils.aoa_to_sheet(wsDataBank);
          XLSX.utils.book_append_sheet(wb, ws1, "Data Bank");

          const wsSummary = [
              [summaryHeader],
              summaryTableData[0], 
              summaryTableData[1], 
              summaryTableData[2], 
              summaryTableData[3], 
              ["Overall Financial Evaluation Result", restOfData.overallFinancialEvaluationResult || 'N/A'] 
          ];
          const ws2 = XLSX.utils.aoa_to_sheet(wsSummary);
          XLSX.utils.book_append_sheet(wb, ws2, "Summary");

          const wsDetailedAnalysis = [
              [detailedAnalysisHeader],
              [formInputs.keyInformation || 'N/A']
          ];
          const ws3 = XLSX.utils.aoa_to_sheet(wsDetailedAnalysis);
          XLSX.utils.book_append_sheet(wb, ws3, "Detailed Analysis");

          const wsCriteria = [
              [criteriaHeader],
              ...Object.entries(financialCriteriaLegend).map(([level, criteria]) => [level, criteria])
          ];
          const ws4 = XLSX.utils.aoa_to_sheet(wsCriteria);
          XLSX.utils.book_append_sheet(wb, ws4, "Criteria Legend");

          XLSX.writeFile(wb, `${vendorName}_Evaluation_Report.xlsx`);

      } else if (format === 'word') {
          const { Document, Packer, Paragraph, Table: DocxTable, TableCell, TableRow, TextRun, HeadingLevel, WidthType, BorderStyle } = await import('docx');
          const { saveAs } = await import('file-saver');

          const sections = [];
          sections.push(new Paragraph({ text: vendorName + " - Financial Evaluation Report", heading: HeadingLevel.TITLE }));
          
          sections.push(new Paragraph({ text: dataBankHeader, heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }));
          const dataBankTableRows = dataBankFields.map(f => new TableRow({
              children: [
                  new TableCell({ children: [new Paragraph(f.label)], width: { size: 30, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph(f.value || 'N/A')], width: { size: 70, type: WidthType.PERCENTAGE } }),
              ],
          }));
          sections.push(new DocxTable({ rows: dataBankTableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

          sections.push(new Paragraph({ text: summaryHeader, heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }));
          
          const summaryDocxTableRows = [
              new TableRow({
                  children: summaryTableData[0].map(headerText => new TableCell({ children: [new Paragraph({children: [new TextRun({text: headerText, bold: true})]})], borders: { top: {style: BorderStyle.SINGLE, size: 1}, bottom: {style: BorderStyle.SINGLE, size: 1}, left: {style: BorderStyle.SINGLE, size: 1}, right: {style: BorderStyle.SINGLE, size: 1} }})),
                  tableHeader: true,
              }),
              ...summaryTableData.slice(1).map((rowData, rowIndex) => new TableRow({
                  children: rowData.map((cellText, cellIndex) => {
                      if (cellIndex === 4 && rowIndex === 0) { 
                          return new TableCell({
                              children: [new Paragraph(restOfData.overallFinancialEvaluationResult || 'N/A')],
                              rowSpan: 3, 
                              borders: { top: {style: BorderStyle.SINGLE, size: 1}, bottom: {style: BorderStyle.SINGLE, size: 1}, left: {style: BorderStyle.SINGLE, size: 1}, right: {style: BorderStyle.SINGLE, size: 1} }
                          });
                      }
                      if (cellIndex === 4 && rowIndex > 0) return null; 
                      return new TableCell({ children: [new Paragraph(String(cellText || 'N/A'))], borders: { top: {style: BorderStyle.SINGLE, size: 1}, bottom: {style: BorderStyle.SINGLE, size: 1}, left: {style: BorderStyle.SINGLE, size: 1}, right: {style: BorderStyle.SINGLE, size: 1} } });
                  }).filter(cell => cell !== null) as TableCell[],
              })),
          ];

          sections.push(new DocxTable({ rows: summaryDocxTableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

          sections.push(new Paragraph({ text: detailedAnalysisHeader, heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }));
          sections.push(new Paragraph(formInputs.keyInformation || 'N/A'));

          sections.push(new Paragraph({ text: criteriaHeader, heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }));
          const criteriaTableRows = Object.entries(financialCriteriaLegend).map(([level, criteria]) => new TableRow({
              children: [
                  new TableCell({ children: [new Paragraph(level)], width: { size: 30, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph(criteria)], width: { size: 70, type: WidthType.PERCENTAGE } }),
              ],
          }));
          sections.push(new DocxTable({ rows: criteriaTableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

          const doc = new Document({ sections: [{ children: sections }] });
          Packer.toBlob(doc).then(blob => {
              saveAs(blob, `${vendorName}_Evaluation_Report.docx`);
          });
      }
      toast({ title: "Export Success", description: `Report for ${vendorName} is being downloaded as ${format.toUpperCase()}.` });
    } catch (error) {
        console.error(`Error exporting to ${format}:`, error);
        toast({ title: "Export Failed", description: `Could not generate ${format.toUpperCase()} report. ${error instanceof Error ? error.message : ''}`, variant: "destructive"});
    } finally {
        setIsExporting(false);
    }
  };
  
  const handlePrintReport = () => {
    window.print();
  };


  return (
    <Card className="shadow-xl rounded-lg w-full print-container">
      <CardHeader className="print-hide">
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
                <Input id="vendorName" name="vendorName" type="text" placeholder="e.g., Acme Corp" value={formInputs.vendorName} onChange={handleInputChange} required className="mt-1" disabled={!!initialData} />
              </div>
              <div>
                <Label htmlFor="overallResult" className="text-foreground">Overall Result (Data Bank)</Label>
                <Input id="overallResult" name="overallResult" type="text" placeholder="e.g., Favorable, High Risk" value={formInputs.overallResult || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="vendorIndustry" className="text-foreground">Vendor Industry</Label>
                <Input id="vendorIndustry" name="vendorIndustry" type="text" placeholder="e.g., Manufacturing" value={formInputs.vendorIndustry || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="companySize" className="text-foreground">Company Size</Label>
                <Input id="companySize" name="companySize" type="text" placeholder="e.g., 500 employees or Large" value={formInputs.companySize || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="tenderNumber" className="text-foreground">Tender Number</Label>
                <Input id="tenderNumber" name="tenderNumber" type="text" placeholder="e.g., TND-2024-001" value={formInputs.tenderNumber || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="tenderTitle" className="text-foreground">Tender Title</Label>
                <Input id="tenderTitle" name="tenderTitle" type="text" placeholder="e.g., Supply of Office Equipment" value={formInputs.tenderTitle || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="dateOfFinancialEvaluation" className="text-foreground">Date of Financial Evaluation</Label>
                <Input id="dateOfFinancialEvaluation" name="dateOfFinancialEvaluation" type="date" value={formInputs.dateOfFinancialEvaluation || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="evaluationValidityDate" className="text-foreground">Evaluation Validity Date</Label>
                <Input id="evaluationValidityDate" name="evaluationValidityDate" type="date" value={formInputs.evaluationValidityDate || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="evaluatorNameDepartment" className="text-foreground">Evaluator Name/Department</Label>
                <Input id="evaluatorNameDepartment" name="evaluatorNameDepartment" type="text" placeholder="e.g., John Doe, Procurement" value={formInputs.evaluatorNameDepartment || ''} onChange={handleInputChange} className="mt-1"/>
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
                <Input id="quantitativeScore" name="quantitativeScore" value={formInputs.quantitativeScore || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="quantitativeBand">Band</Label>
                <Input id="quantitativeBand" name="quantitativeBand" value={formInputs.quantitativeBand || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="quantitativeRiskCategory">Risk Category</Label>
                <Input id="quantitativeRiskCategory" name="quantitativeRiskCategory" value={formInputs.quantitativeRiskCategory || ''} onChange={handleInputChange} className="mt-1"/>
              </div>

              <Separator className="md:col-span-3 my-2"/>
              <h4 className="md:col-span-3 text-md font-medium text-muted-foreground">Altman - Z</h4>
              <div>
                <Label htmlFor="altmanZScore">Score</Label>
                <Input id="altmanZScore" name="altmanZScore" value={formInputs.altmanZScore || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="altmanZBand">Band</Label>
                <Input id="altmanZBand" name="altmanZBand" value={formInputs.altmanZBand || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="altmanZRiskCategory">Risk Category</Label>
                <Input id="altmanZRiskCategory" name="altmanZRiskCategory" value={formInputs.altmanZRiskCategory || ''} onChange={handleInputChange} className="mt-1"/>
              </div>

              <Separator className="md:col-span-3 my-2"/>
              <h4 className="md:col-span-3 text-md font-medium text-muted-foreground">Qualitative</h4>
              <div>
                <Label htmlFor="qualitativeScore">Score</Label>
                <Input id="qualitativeScore" name="qualitativeScore" value={formInputs.qualitativeScore || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="qualitativeBand">Band</Label>
                <Input id="qualitativeBand" name="qualitativeBand" value={formInputs.qualitativeBand || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="qualitativeRiskCategory">Risk Category</Label>
                <Input id="qualitativeRiskCategory" name="qualitativeRiskCategory" value={formInputs.qualitativeRiskCategory || ''} onChange={handleInputChange} className="mt-1"/>
              </div>
            </div>
            
            <Separator className="my-4"/>
            <div>
              <Label htmlFor="overallFinancialEvaluationResult" className="text-foreground">Overall Financial Evaluation Result (Summary)</Label>
              <Textarea id="overallFinancialEvaluationResult" name="overallFinancialEvaluationResult" placeholder="Enter overall financial evaluation summary..." value={formInputs.overallFinancialEvaluationResult || ''} onChange={handleInputChange} className="mt-1 min-h-[100px]"/>
            </div>
          </section>
          
          <Separator />

          <section className="space-y-4 p-4 border rounded-md">
             <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Additional Notes / Detailed Analysis</h3>
            <div>
              <Label htmlFor="keyInformation" className="text-foreground">Key Information / Other Notes</Label>
              <Textarea id="keyInformation" name="keyInformation" placeholder="Enter any other specific details or notes..." value={formInputs.keyInformation || ''} onChange={handleInputChange} className="mt-1 min-h-[100px]"/>
            </div>
          </section>
          
          <div className="flex flex-col sm:flex-row gap-2 print-hide">
            <Button type="submit" disabled={isLoading || isExporting || !formInputs.vendorName.trim()} className="flex-grow bg-primary hover:bg-primary/90 text-base py-3">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {initialData ? 'Update Vendor Data' : 'Save Vendor Data'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-grow sm:flex-none text-base py-3" disabled={isExporting || isLoading}>
                  {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                   Export / Print
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrintReport} disabled={isExporting}>
                  <Printer className="mr-2 h-4 w-4" /> Print Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('txt')} disabled={isExporting}>
                  <FileJson className="mr-2 h-4 w-4" /> Download TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('pdf')} disabled={isExporting}>
                  <FileType className="mr-2 h-4 w-4" /> Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('excel')} disabled={isExporting}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('word')} disabled={isExporting}>
                  <FileType className="mr-2 h-4 w-4" /> Download Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </form>
      </CardContent>
      <CardFooter className="pt-6 border-t mt-6 print-hide">
        <p className="text-xs text-muted-foreground">All entered data will be saved locally in your browser's database.</p>
      </CardFooter>
    </Card>
  );
}
