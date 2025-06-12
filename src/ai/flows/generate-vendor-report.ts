
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
  // vendorIndustry: z.string().optional().describe('The industry the vendor operates in.'), // Removed
  // companySize: z.string().optional().describe('The size of the vendor company (e.g., Small, Medium, Large, or employee count).'), // Removed
  // keyInformation: z.string().optional().describe('Any specific key information or requests to focus on for the report. This could include specific financial areas of concern or aspects to highlight.'), // Removed
  tenderNumber: z.string().optional().describe('The tender number associated with this evaluation.'),
  tenderTitle: z.string().optional().describe('The title of the tender.'),
  dateOfFinancialEvaluation: z.string().optional().describe('The date the financial evaluation was performed (e.g., YYYY-MM-DD).'),
  evaluationValidityDate: z.string().optional().describe('The date until which this evaluation is considered valid (e.g., YYYY-MM-DD).'),
  evaluatorNameDepartment: z.string().optional().describe('The name and/or department of the person or team performing the evaluation.'),
  overallResult: z.string().optional().describe('The overall evaluation result or status from the VENDOR DATA BANK section (e.g., "Favorable", "Requires Monitoring", "High Risk").'),
  quantitativeScore: z.string().optional().describe('The score for quantitative analysis.'),
  quantitativeBand: z.string().optional().describe('The band associated with the quantitative score.'),
  quantitativeRiskCategory: z.string().optional().describe('The risk category based on quantitative analysis (e.g., Low, Moderate, High).'),
  altmanZScore: z.string().optional().describe('The Altman Z-Score value.'),
  altmanZBand: z.string().optional().describe('The band associated with the Altman Z-Score.'),
  altmanZRiskCategory: z.string().optional().describe('The risk category based on Altman Z-Score.'),
  qualitativeScore: z.string().optional().describe('The score or assessment for qualitative analysis (e.g., "Strong", "Satisfactory", "Weak").'),
  qualitativeBand: z.string().optional().describe('The band associated with the qualitative assessment.'),
  qualitativeRiskCategory: z.string().optional().describe('The risk category based on qualitative analysis.'),
  overallFinancialEvaluationResult: z.string().optional().describe('A conclusive statement on the overall financial evaluation from the SUMMARY section.'),
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
{{#if overallResult}}- Overall Result (from Data Bank): {{{overallResult}}}{{/if}}
{{#if tenderNumber}}- Tender Number: {{{tenderNumber}}}{{/if}}
{{#if tenderTitle}}- Tender Title: {{{tenderTitle}}}{{/if}}
{{#if dateOfFinancialEvaluation}}- Date of Financial Evaluation: {{{dateOfFinancialEvaluation}}}{{/if}}
{{#if evaluationValidityDate}}- Evaluation Validity Date: {{{evaluationValidityDate}}}{{/if}}
{{#if evaluatorNameDepartment}}- Evaluator Name/Department: {{{evaluatorNameDepartment}}}{{/if}}

Summary of Financial Evaluations Input:
- Quantitative: Score: {{#if quantitativeScore}}{{{quantitativeScore}}}{{else}}N/A{{/if}}, Band: {{#if quantitativeBand}}{{{quantitativeBand}}}{{else}}N/A{{/if}}, Risk: {{#if quantitativeRiskCategory}}{{{quantitativeRiskCategory}}}{{else}}N/A{{/if}}
- Altman - Z: Score: {{#if altmanZScore}}{{{altmanZScore}}}{{else}}N/A{{/if}}, Band: {{#if altmanZBand}}{{{altmanZBand}}}{{else}}N/A{{/if}}, Risk: {{#if altmanZRiskCategory}}{{{altmanZRiskCategory}}}{{else}}N/A{{/if}}
- Qualitative: Score: {{#if qualitativeScore}}{{{qualitativeScore}}}{{else}}N/A{{/if}}, Band: {{#if qualitativeBand}}{{{qualitativeBand}}}{{else}}N/A{{/if}}, Risk: {{#if qualitativeRiskCategory}}{{{qualitativeRiskCategory}}}{{else}}N/A{{/if}}
- Overall Financial Evaluation Result (Summary Input): {{#if overallFinancialEvaluationResult}}{{{overallFinancialEvaluationResult}}}{{else}}N/A{{/if}}

Instructions for Report Generation:

1.  **VENDOR DATA BANK FOR FINANCIAL EVALUATION Section**:
    *   \`overallResult\`: Use the input \`overallResult\` if provided, otherwise generate a concise overall assessment status (e.g., "Favorable", "Requires Monitoring", "High Risk").
    *   Populate \`nameOfCompanyAssessed\` with the input \`vendorName\`.
    *   Populate \`tenderNumber\`, \`tenderTitle\`, \`dateOfFinancialEvaluation\`, \`evaluationValidityDate\`, \`evaluatorNameDepartment\` directly from the provided input if available. If an optional input field is not provided, output "N/A".

2.  **SUMMARY OF VENDOR FINANCIAL EVALUATIONS Section**:
    *   This section should be presented conceptually as a table with rows for "Score", "Band", and "Risk Category".
    *   It will have columns for "Quantitative", "Altman - Z", "Qualitative", and "Overall Financial Evaluation Result".
    *   For the "Quantitative", "Altman - Z", and "Qualitative" aspects, use the provided input scores, bands, and risk categories (\`quantitativeScore\`, \`altmanZScore\`, \`qualitativeScore\`, etc.). If any of these specific sub-fields are not provided in the input, you should still attempt to generate or infer reasonable values for the output schema (e.g., "Not Assessed" or a derived value).
    *   For the "Overall Financial Evaluation Result" aspect, the content will be stored in the \`overallFinancialEvaluationResult\` field in the output. Use the input \`overallFinancialEvaluationResult\` if provided, otherwise, generate a single, comprehensive concluding statement summarizing the findings from all assessments. It is not broken down by score/band/risk category itself but is a holistic summary.

3.  **FINANCIAL SUB-ELEMENT CRITERIA Guidance (for your internal use to determine \`determinedRiskLevel\` output)**:
    *   Use the following as a general guide for your overall risk assessment. Your output for \`determinedRiskLevel\` should align with this framework. The determination should be holistic, considering all available financial data.
        *   **Green**: Consider if Quantitative is \`> 3\`, Altman-Z is \`2 – 3\`, AND Qualitative is \`< 2\`.
        *   **Yellow**: Consider if Quantitative is \`>2.6\`, Altman-Z is \`1.1 – 2.6\`, AND Qualitative is \`<1.1\`.
        *   **Red**: Consider if Quantitative is assessed as 'Low Risk', Altman-Z as 'Moderate Risk', AND Qualitative as 'High Risk'. A 'High Risk' qualitative assessment is a strong indicator for Red.
    *   \`determinedRiskLevel\`: Based on your comprehensive analysis of all factors, classify the vendor's overall financial risk into "Green", "Yellow", or "Red". This is a single output field reflecting your holistic judgment.

4.  **Detailed Analysis (Separate Section)**:
    *   \`detailedAnalysis\`: Provide a thorough narrative. This section is crucial and supports the summary. It should include:
        *   An overview of the vendor's financial health based on the provided scores, bands, and risk categories.
        *   Analysis of implied strengths and weaknesses from the financial evaluation inputs.
        *   Justification for the scores, bands, and risk categories assigned in the 'SUMMARY OF VENDOR FINANCIAL EVALUATIONS' section if they were generated/inferred.
        *   An explanation of how you arrived at the \`determinedRiskLevel\`.
        *   The analysis should be comprehensive and data-driven based on the inputs.

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
    const {output} = await prompt(input);

    // Ensure fields that should mirror input are correctly set to the input value, or "N/A" if the input was undefined/empty.
    return {
        ...output!, 
        nameOfCompanyAssessed: input.vendorName || "N/A", 
        tenderNumber: input.tenderNumber || "N/A",
        tenderTitle: input.tenderTitle || "N/A",
        dateOfFinancialEvaluation: input.dateOfFinancialEvaluation || "N/A",
        evaluationValidityDate: input.evaluationValidityDate || "N/A",
        evaluatorNameDepartment: input.evaluatorNameDepartment || "N/A",
        // Ensure summary fields from input are passed through to output if AI doesn't override
        summaryOfEvaluations: {
            quantitativeScore: output?.summaryOfEvaluations?.quantitativeScore || input.quantitativeScore || "N/A",
            quantitativeBand: output?.summaryOfEvaluations?.quantitativeBand || input.quantitativeBand || "N/A",
            quantitativeRiskCategory: output?.summaryOfEvaluations?.quantitativeRiskCategory || input.quantitativeRiskCategory || "N/A",
            altmanZScore: output?.summaryOfEvaluations?.altmanZScore || input.altmanZScore || "N/A",
            altmanZBand: output?.summaryOfEvaluations?.altmanZBand || input.altmanZBand || "N/A",
            altmanZRiskCategory: output?.summaryOfEvaluations?.altmanZRiskCategory || input.altmanZRiskCategory || "N/A",
            qualitativeScore: output?.summaryOfEvaluations?.qualitativeScore || input.qualitativeScore || "N/A",
            qualitativeBand: output?.summaryOfEvaluations?.qualitativeBand || input.qualitativeBand || "N/A",
            qualitativeRiskCategory: output?.summaryOfEvaluations?.qualitativeRiskCategory || input.qualitativeRiskCategory || "N/A",
            overallFinancialEvaluationResult: output?.summaryOfEvaluations?.overallFinancialEvaluationResult || input.overallFinancialEvaluationResult || "N/A",
        },
         overallResult: output?.overallResult || input.overallResult || "N/A", // Ensure top-level overallResult is also handled
    };
  }
);

