
'use server';

/**
 * @fileOverview An AI agent for tutoring students on course content.
 *
 * - courseTutor - A function that answers questions about a given lesson.
 * - CourseTutorInput - The input type for the courseTutor function.
 * - CourseTutorOutput - The return type for the courseTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseTutorInputSchema = z.object({
  question: z.string().describe('The student\'s question about the lesson.'),
  courseContext: z.string().describe('The full text content of the current lesson.'),
});
export type CourseTutorInput = z.infer<typeof CourseTutorInputSchema>;

const CourseTutorOutputSchema = z.object({
  answer: z.string().describe("Gina's helpful answer to the student's question."),
});
export type CourseTutorOutput = z.infer<typeof CourseTutorOutputSchema>;

export async function courseTutor(
  input: CourseTutorInput
): Promise<CourseTutorOutput> {
  return courseTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'courseTutorPrompt',
  input: {schema: CourseTutorInputSchema},
  output: {schema: CourseTutorOutputSchema},
  prompt: `You are Gina, an expert AI Tutor for the Mkenya Skilled online learning platform. Your tone is encouraging, friendly, and very helpful.

You will be given the content of a specific lesson and a student's question about it. Your task is to answer the student's question based *only* on the provided course context. Do not use any external knowledge.

If the question cannot be answered from the context, politely explain that you can only answer questions related to the current lesson material.

Lesson Content:
---
{{{courseContext}}}
---

Student's Question:
"{{{question}}}"

Please provide a clear, helpful, and detailed answer.`,
});

const courseTutorFlow = ai.defineFlow(
  {
    name: 'courseTutorFlow',
    inputSchema: CourseTutorInputSchema,
    outputSchema: CourseTutorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
