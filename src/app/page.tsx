
// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, FilePlus, Search, ClipboardList, FileDown, Brain, Info } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center p-6">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-headline font-black text-primary mb-4">
          Welcome to Vendor Insights
        </h1>
        <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
          Streamline your vendor financial evaluations from data entry to comprehensive reporting.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 w-full max-w-5xl mb-12">
        <Card className="shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold text-accent">
              Leverage Powerful Features
            </CardTitle>
            <CardDescription className="text-lg">
              Utilize the full capabilities of Vendor Insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <div className="flex items-start space-x-3">
              <ClipboardList className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">In-Depth Evaluation Summaries</h3>
                <p className="text-muted-foreground">
                  View structured summaries including quantitative scores, Altman Z-scores, qualitative assessments, and overall risk categorizations.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileDown className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">Versatile Report Exports</h3>
                <p className="text-muted-foreground">
                  Generate and download evaluation reports in various formats: TXT, PDF, Word (DOCX), and Excel (XLSX) for easy sharing and record-keeping.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Brain className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">AI-Assisted Insights</h3>
                <p className="text-muted-foreground">
                  Input key information and notes to guide AI in generating detailed analysis and populating report sections, tailoring insights to your focus.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="w-full max-w-5xl shadow-lg rounded-xl border-accent">
        <Info className="h-5 w-5 text-accent" />
        <AlertTitle className="text-accent font-semibold">Pro Tip!</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          When entering vendor data, use the "Key Information / Other Notes" field to provide specific instructions or highlight areas of concern. The AI will use this context to generate more tailored and relevant detailed analysis in your reports.
        </AlertDescription>
      </Alert>

      <footer className="mt-16 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Vendor Insights. All rights reserved.</p>
        <p className="text-sm">Empowering Your Procurement Decisions.</p>
      </footer>
    </div>
  );
}
