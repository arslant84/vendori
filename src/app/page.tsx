
// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FilePlus, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-6">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-headline font-black text-primary mb-4">
          Vendor Insights
        </h1>
        <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
          Streamlined Vendor Evaluation & Information Management. Easily enter, store, and retrieve vendor assessment details.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold flex items-center text-accent">
              <FilePlus className="mr-3 h-8 w-8" />
              Enter New Vendor Evaluation
            </CardTitle>
            <CardDescription className="text-lg">
              Input and save comprehensive financial evaluation details for new or existing vendors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/key-in-vendor-data" passHref>
              <Button size="lg" className="w-full text-lg py-7 bg-accent hover:bg-accent/90">
                Go to Data Entry
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold flex items-center text-accent">
              <Search className="mr-3 h-8 w-8" />
              Search & Retrieve Evaluations
            </CardTitle>
            <CardDescription className="text-lg">
              Access your Vendor Data Bank. Search for existing vendors and load their saved evaluation data for review or updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search-vendor-report" passHref>
              <Button size="lg" className="w-full text-lg py-7 bg-accent hover:bg-accent/90">
                Go to Vendor Bank
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-16 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Vendor Insights. All rights reserved.</p>
        <p className="text-sm">Empowering Your Procurement Decisions.</p>
      </footer>
    </div>
  );
}
