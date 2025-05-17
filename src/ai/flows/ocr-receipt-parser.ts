// src/ai/flows/ocr-receipt-parser.ts
'use server';
/**
 * @fileOverview An OCR-based receipt parser flow that extracts transaction details from a receipt image.
 *
 * - ocrReceiptParser - A function that handles the receipt parsing process.
 * - OcrReceiptParserInput - The input type for the ocrReceiptParser function.
 * - OcrReceiptParserOutput - The return type for the ocrReceiptParser function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OcrReceiptParserInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OcrReceiptParserInput = z.infer<typeof OcrReceiptParserInputSchema>;

const OcrReceiptParserOutputSchema = z.object({
  vendor: z.string().describe('The name of the vendor on the receipt.'),
  amount: z.number().describe('The total amount on the receipt.'),
  date: z.string().describe('The date on the receipt in ISO format (YYYY-MM-DD).'),
});
export type OcrReceiptParserOutput = z.infer<typeof OcrReceiptParserOutputSchema>;

export async function ocrReceiptParser(input: OcrReceiptParserInput): Promise<OcrReceiptParserOutput> {
  return ocrReceiptParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrReceiptParserPrompt',
  input: {schema: OcrReceiptParserInputSchema},
  output: {schema: OcrReceiptParserOutputSchema},
  prompt: `You are an expert financial assistant specializing in extracting information from receipts using OCR (Optical Character Recognition).

You will be provided with an image of a receipt, and your task is to extract the vendor name, the total amount, and the date from the receipt.

Return the data as a JSON object with the keys \"vendor\", \"amount\", and \"date\". The date must be in ISO format (YYYY-MM-DD).

Here is the receipt image:
{{media url=photoDataUri}}`,
});

const ocrReceiptParserFlow = ai.defineFlow(
  {
    name: 'ocrReceiptParserFlow',
    inputSchema: OcrReceiptParserInputSchema,
    outputSchema: OcrReceiptParserOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
