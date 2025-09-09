
'use server';
/**
 * @fileOverview An AI agent for formalizing documentation.
 */

import { ai } from '@/ai/genkit-instance';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

export const GenerateFormalDocumentInputSchema = z.object({
  docType: z.enum(['FRAMEWORK.md', 'API.md', 'PITCH_DECK.md', 'RESOLUTION_TO_REGISTER_A_COMPANY.md', 'PATENT_APPLICATION.md']),
  content: z.string().describe('The current markdown content of the document.'),
});
export type GenerateFormalDocumentInput = z.infer<typeof GenerateFormalDocumentInputSchema>;

export const GenerateFormalDocumentOutputSchema = z.object({
  formal_document: z.string().describe('The updated, formalized markdown content of the document.'),
});
export type GenerateFormalDocumentOutput = z.infer<typeof GenerateFormalDocumentOutputSchema>;

const prompts = {
    'FRAMEWORK.md': `You are an expert technical writer. Your task is to refine the provided FRAMEWORK.md content. Improve its structure, clarity, and professionalism. Ensure it accurately reflects a modern tech stack (Next.js, Firebase, Genkit) and follows best practices for technical documentation. The output should be in well-formatted markdown.`,
    'API.md': `You are an API documentation specialist. Review the provided API.md content and improve it. Ensure it follows OpenAPI standards where applicable (even in markdown), is clear for external developers, and includes examples. The output must be in well-formatted markdown.`,
    'PITCH_DECK.md': `You are a startup consultant and pitch deck expert. Your task is to take the provided PITCH_DECK.md content and make it more compelling for potential investors. Sharpen the messaging, improve the narrative flow, and ensure each slide has a clear, powerful point. The output must be in well-formatted markdown, structured as a 10-slide deck.`,
    'RESOLUTION_TO_REGISTER_A_COMPANY.md': `You are a corporate legal assistant. Your task is to formalize the provided RESOLUTION_TO_REGISTER_A_COMPANY.md content. Ensure it uses proper legal language, follows the correct structure for a board resolution, and includes all necessary clauses for registering a company in Kenya. The output must be in well-formatted markdown.`,
    'PATENT_APPLICATION.md': `You are a patent attorney's assistant. Your task is to refine the provided PATENT_APPLICATION.md content into a more formal and structured patent application draft. Focus on clarity, precision, and adherence to standard patent filing formats. Define the abstract, background, summary, detailed description, and claims sections clearly. The output must be in well-formatted markdown.`
};

export async function generateFormalDocument(input: GenerateFormalDocumentInput): Promise<GenerateFormalDocumentOutput> {
    return generateFormalDocumentFlow(input);
}

const generateFormalDocumentFlow = ai.defineFlow(
  {
    name: 'generateFormalDocumentFlow',
    inputSchema: GenerateFormalDocumentInputSchema,
    outputSchema: GenerateFormalDocumentOutputSchema,
  },
  async ({ docType, content }) => {
    
    const response = await ai.generate({
        prompt: `
            ${prompts[docType]}

            Here is the current document content:
            ---
            ${content}
            ---
        `,
        model: googleAI.model('gemini-1.5-pro'),
        output: {
            schema: GenerateFormalDocumentOutputSchema,
        },
    });
    
    const output = response.output;
    if (!output) {
        throw new Error('Failed to generate document content.');
    }

    return output;
  }
);
