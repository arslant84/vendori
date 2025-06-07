// src/ai/flows/generate-vendor-report.ts
'use server';

/**
 * @fileOverview Generates a structured financial evaluation report for a given vendor using AI.
 *
 * - generateVendorReport - A function that handles the vendor report generation process.
 * - GenerateVendorReportInput - The input type for the generateVendorReport function.
 * - GenerateVendorReportOutput - The return type for the generateVendorReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVendorReportInputSchema = z.object({
  vendorName: z.string().describe('The name of the vendor.'),
  vendorIndustry: z.string().optional().describe('The industry the vendor operates in.'),
  companySize: z.string().optional().describe('The size of the vendor company (e.g., Small, Medium, Large, or employee count).'),
  keyInformation: z.string().optional().describe('Any specific key information or requests to focus on for the report. This could include specific financial areas of concern or aspects to highlight.'),
  tenderNumber: z.string().optional().describe('The tender number associated with this evaluation.'),
  tenderTitle: z.string().optional().describe('The title of the tender.'),
  dateOfFinancialEvaluation: z.string().optional().describe('The date the financial evaluation was performed (e.g., YYYY-MM-DD).'),
  evaluationValidityDate: z.string().optional().describe('The date until which this evaluation is considered valid (e.g., YYYY-MM-DD).'),
  evaluatorNameDepartment: z.string().optional().describe('The name and/or department of the person or team performing the evaluation.'),
});
export type GenerateVendorReportInput = z.infer<typeof GenerateVendorReportInputSchema>;

const GenerateVendorReportOutputSchema = z.object({
  overallResult: z.string().describe('The overall evaluation result or status (e.g., "Favorable", "Requires Monitoring", "High Risk"). This should be a concise statement for the "VENDOR DATA BANK FOR FINANCIAL EVALUATION" section.'),
  nameOfCompanyAssessed: z.string().describe('The name of the company being assessed (should match input vendorName).'),
  tenderNumber: z.string().describe('The tender number (should match input or be "N/A" if not provided).'),
  tenderTitle: z.string().describe('The tender title (should match input or be "N/A" if not provided).'),
  dateOfFinancialEvaluation: z.string().describe('The date of financial evaluation (should match input or be "N/A" if not provided).'),
  evaluationValidityDate: z.string().describe('The evaluation validity date (should match input or be "N/A" if not provided).'),
  evaluatorNameDepartment: z.string().describe('The name/department of the evaluator (should match input or be "N/A" if not provided).'),

  summaryOfEvaluations: z.object({
    quantitativeScore: z.string().describe('The score for quantitative analysis.'),
    quantitativeBand: z.string().describe('The band associated with the quantitative score.'),
    quantitativeRiskCategory: z.string().describe('The risk category based on quantitative analysis (e.g., Low, Moderate, High).'),

    altmanZScore: z.string().describe('The Altman Z-Score value.'),
    altmanZBand: z.string().describe('The band associated with the Altman Z-Score.'),
    altmanZRiskCategory: z.string().describe('The risk category based on Altman Z-Score.'),

    qualitativeScore: z.string().describe('The score or assessment for qualitative analysis (e.g., "Strong", "Satisfactory", "Weak").'),
    qualitativeBand: z.string().describe('The band associated with the qualitative assessment.'),
    qualitativeRiskCategory: z.string().describe('The risk category based on qualitative analysis.'),

    overallFinancialEvaluationResult: z.string().describe('A conclusive statement on the overall financial evaluation. This will be displayed as part of the "SUMMARY OF VENDOR FINANCIAL EVALUATIONS".'),
  }),

  determinedRiskLevel: z.enum(["Green", "Yellow", "Red"]).describe('The overall determined risk level corresponding to Green (Low Risk), Yellow (Moderate Risk), or Red (High Risk) criteria, based on the "FINANCIAL SUB-ELEMENT CRITERIA".'),
  detailedAnalysis: z.string().describe('A comprehensive textual analysis supporting the evaluation, including financial details, strengths, weaknesses, and justifications for scores and risk categories. This section is separate from the summary tables.'),
});
export type GenerateVendorReportOutput = z.infer<typeof GenerateVendorReportOutputSchema>;

export async function generateVendorReport(input: GenerateVendorReportInput): Promise<GenerateVendorReportOutput> {
  return generateVendorReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVendorReportPrompt',
  input: {schema: GenerateVendorReportInputSchema},
  output: {schema: GenerateVendorReportOutputSchema},
  prompt: `You are an expert financial analyst AI. Your task is to generate a detailed financial evaluation report for the given vendor, strictly adhering to the output schema and the requested format.

Vendor Details:
- Name: {{{vendorName}}}
{{#if vendorIndustry}}- Industry: {{{vendorIndustry}}}{{/if}}
{{#if companySize}}- Company Size: {{{companySize}}}{{/if}}
{{#if tenderNumber}}- Tender Number: {{{tenderNumber}}}{{/if}}
{{#if tenderTitle}}- Tender Title: {{{tenderTitle}}}{{/if}}
{{#if dateOfFinancialEvaluation}}- Date of Financial Evaluation: {{{dateOfFinancialEvaluation}}}{{/if}}
{{#if evaluationValidityDate}}- Evaluation Validity Date: {{{evaluationValidityDate}}}{{/if}}
{{#if evaluatorNameDepartment}}- Evaluator Name/Department: {{{evaluatorNameDepartment}}}{{/if}}
{{#if keyInformation}}- Key Information/Specific Requests: {{{keyInformation}}}{{/if}}

Instructions for Report Generation:

1.  **VENDOR DATA BANK FOR FINANCIAL EVALUATION Section**:
    *   \`overallResult\`: Provide a concise overall assessment status (e.g., "Favorable", "Requires Monitoring", "High Risk").
    *   Populate \`nameOfCompanyAssessed\` with the input \`vendorName\`.
    *   Populate \`tenderNumber\`, \`tenderTitle\`, \`dateOfFinancialEvaluation\`, \`evaluationValidityDate\`, \`evaluatorNameDepartment\` directly from the provided input if available. If an optional input field is not provided, output "N/A".

2.  **SUMMARY OF VENDOR FINANCIAL EVALUATIONS Section**:
    *   For Quantitative, Altman-Z, and Qualitative categories:
        *   \`score\`: Generate a relevant score. For Quantitative and Altman-Z, this should be numerical (e.g., "3.5", "2.1"). For Qualitative, it can be a descriptive score (e.g., "Strong", "Satisfactory", "Weak") or a numerical representation if appropriate (e.g., "1.5").
        *   \`band\`: Assign a band based on the score (e.g., "A", "B", "C" or "Excellent", "Good", "Fair").
        *   \`riskCategory\`: Determine the risk category (e.g., "Low Risk", "Moderate Risk", "High Risk") for each individual component.
    *   \`overallFinancialEvaluationResult\`: Provide a concluding statement summarizing the findings from the quantitative, Altman-Z, and qualitative assessments. This is a key summary text.

3.  **FINANCIAL SUB-ELEMENT CRITERIA Guidance (for your internal use to determine \`determinedRiskLevel\` output)**:
    *   Use the following as a general guide for your overall risk assessment. Your output for \`determinedRiskLevel\` should align with this framework:
        *   Green (Low Overall Risk): Generally implies Quantitative score > 3, Altman-Z score is between 2 and 3, and Qualitative score is < 2 (if numeric, lower is better for qualitative).
        *   Yellow (Moderate Overall Risk): Generally implies Quantitative score > 2.6, Altman-Z score is between 1.1 and 2.6, and Qualitative score is < 1.1.
        *   Red (High Overall Risk): If the overall risk is determined as Red, this often means the Qualitative assessment indicates 'High Risk', the Altman-Z score might suggest 'Moderate Risk', and even if the Quantitative analysis appears 'Low Risk' in isolation, the combination of other factors leads to an overall 'Red' determination.
    *   \`determinedRiskLevel\`: Based on your comprehensive analysis of all factors, classify the vendor's overall financial risk into "Green", "Yellow", or "Red". This is a single output field reflecting your holistic judgment.

4.  **Detailed Analysis (Separate Section)**:
    *   \`detailedAnalysis\`: Provide a thorough narrative. This section is crucial and supports the summary. It should include:
        *   An overview of the vendor's financial health.
        *   Analysis of key financial statements/ratios (if available or inferable).
        *   Strengths and weaknesses.
        *   Justification for the scores, bands, and risk categories assigned in the 'SUMMARY OF VENDOR FINANCIAL EVALUATIONS' section.
        *   An explanation of how you arrived at the \`determinedRiskLevel\`.
        *   Address any \`keyInformation\` or specific requests provided.
        *   The analysis should be comprehensive and data-driven. If specific financial data isn't directly provided, you may make reasonable assumptions based on industry, company size, etc., and should state them if doing so.

Ensure all fields in the output schema are populated. Your response MUST be a valid JSON object matching the output schema.
`,
});

const generateVendorReportFlow = ai.defineFlow(
  {
    name: 'generateVendorReportFlow',
    inputSchema: GenerateVendorReportInputSchema,
    outputSchema: GenerateVendorReportOutputSchema,
  },
  async input => {
    // Ensure names match for output
    const effectiveInput = {
        ...input,
        nameOfCompanyAssessed: input.vendorName, // Ensure this is passed for the prompt
    };
    const {output} = await prompt(effectiveInput);

    // Ensure fields that should mirror input are correctly set to the input value, or "N/A" if the input was undefined/empty.
    // The AI might sometimes hallucinate or omit these if not explicitly set post-generation.
    return {
        ...output!, // Assume output is non-null if successful
        nameOfCompanyAssessed: input.vendorName || "N/A", // Should always be the vendor name.
        tenderNumber: input.tenderNumber || "N/A",
        tenderTitle: input.tenderTitle || "N/A",
        dateOfFinancialEvaluation: input.dateOfFinancialEvaluation || "N/A",
        evaluationValidityDate: input.evaluationValidityDate || "N/A",
        evaluatorNameDepartment: input.evaluatorNameDepartment || "N/A",
    };
  }
);

