
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
import { textToSpeech } from './text-to-speech';

const CourseTutorInputSchema = z.object({
  question: z.string().describe('The student\'s question about the lesson, or a command like "Tutor me".'),
  courseContext: z.string().describe('The full text content of the current lesson.'),
  // We can add chat history here in the future to make it more conversational
});
export type CourseTutorInput = z.infer<typeof CourseTutorInputSchema>;

const CourseTutorOutputSchema = z.object({
  answer: z.string().describe("Gina's helpful answer to the student's question or the next step in the tutoring session."),
  answerAudio: z.string().optional().describe('The data URI of the spoken answer audio.'),
  suggestions: z.array(z.string()).optional().describe('A list of 2-3 relevant follow-up questions the student might have.'),
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

You will be given the content of a specific lesson and a student's question about it. Your task is to respond to the student based on the provided course context. Do not use any external knowledge.

**Behavior Scenarios:**

1.  **If the user asks a direct question:**
    *   Answer the student's question based *only* on the provided course context.
    *   If the question cannot be answered from the context, politely explain that you can only answer questions related to the current lesson material.
    *   Provide a clear, helpful, and detailed answer.
    *   After your answer, generate 2-3 short, relevant follow-up questions a student might ask next.

2.  **If the user's input is "Tutor me" or a similar request for guided tutoring:**
    *   Initiate a step-by-step tutoring session.
    *   Begin by breaking down the lesson into smaller, manageable parts.
    *   Start with the first concept. Explain it clearly and concisely.
    *   After explaining a concept, ask a simple question to check for understanding and provide a few logical follow-up questions as suggestions.
    *   For example, you might ask "Does that make sense?" and suggest ["Yes, please continue.", "Can you explain that differently?", "What's an example?"].
    *   Wait for the student's response before explaining the next concept.

---
**Lesson Content:**
---
{{{courseContext}}}
---

**Student's Input:**
"{{{question}}}"

Please provide your response and suggestions now.`,
});

const courseTutorFlow = ai.defineFlow(
  {
    name: 'courseTutorFlow',
    inputSchema: CourseTutorInputSchema,
    outputSchema: CourseTutorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a text answer.');
    }

    const audioResponse = await textToSpeech(output.answer);
    
    return {
        answer: output.answer,
        answerAudio: audioResponse.media,
        suggestions: output.suggestions,
    };
  }
);
