// src/ai/flows/generate-vendor-report.ts
'use server';

/**
 * @fileOverview Generates a summary report for a given vendor using AI.
 *
 * - generateVendorReport - A function that handles the vendor report generation process.
 * - GenerateVendorReportInput - The input type for the generateVendorReport function.
 * - GenerateVendorReportOutput - The return type for the generateVendorReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVendorReportInputSchema = z.object({
  vendorName: z.string().describe('The name of the vendor to generate a report for.'),
});
export type GenerateVendorReportInput = z.infer<typeof GenerateVendorReportInputSchema>;

const GenerateVendorReportOutputSchema = z.object({
  summary: z.string().describe('A summary report of the vendor, including financial information and analysis.'),
});
export type GenerateVendorReportOutput = z.infer<typeof GenerateVendorReportOutputSchema>;

export async function generateVendorReport(input: GenerateVendorReportInput): Promise<GenerateVendorReportOutput> {
  return generateVendorReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVendorReportPrompt',
  input: {schema: GenerateVendorReportInputSchema},
  output: {schema: GenerateVendorReportOutputSchema},
  prompt: `You are an AI assistant that specializes in generating summary reports for vendors.

  Generate a comprehensive report including relevant financial information and analysis based on the vendor name provided.  The vendor name is: {{{vendorName}}}`,
});

const generateVendorReportFlow = ai.defineFlow(
  {
    name: 'generateVendorReportFlow',
    inputSchema: GenerateVendorReportInputSchema,
    outputSchema: GenerateVendorReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
