
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
  question: z.string().optional().describe('The student\'s question about the lesson, or a command like "Tutor me".'),
  action: z.enum(['summarize', 'quiz']).optional().describe('A specific action for the tutor to perform.'),
  courseContext: z.string().describe('The full text content of the current lesson.'),
  voice: z.string().optional().describe('The selected voice for the TTS.'),
  speed: z.number().optional().describe('The selected speed for the TTS.'),
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

You will be given the content of a specific lesson and a student's question or a command. Your task is to respond based on the provided course context. Do not use any external knowledge.

**Behavior Scenarios:**

1.  **If the user asks a direct question (the 'question' field has content):**
    *   Answer the student's question based *only* on the provided course context.
    *   If the question cannot be answered from the context, politely explain that you can only answer questions related to the current lesson material.
    *   Provide a clear, helpful, and detailed answer.
    *   After your answer, generate 2-3 short, relevant follow-up questions a student might ask next.

2.  **If the user's input is "Tutor me" or a similar request for guided tutoring:**
    *   Initiate a step-by-step tutoring session.
    *   Begin by breaking down the lesson into smaller, manageable parts.
    *   Start with the first concept. Explain it clearly and concisely.
    *   After explaining a concept, ask a simple question to check for understanding and provide a few logical follow-up questions as suggestions.

3. **If the 'action' field is 'summarize':**
    *   Provide a concise, easy-to-understand summary of the lesson content in bullet-point format.
    *   Start with a friendly intro, like "Of course! Here is a summary of the key points from this lesson:"

4. **If the 'action' field is 'quiz':**
    *   Generate a short, 3-question multiple-choice quiz based on the lesson content.
    *   Each question must have 3-4 options.
    *   Clearly label the questions (e.g., 1., 2., 3.).
    *   After the questions, provide a separate answer key (e.g., "Answers: 1. B, 2. A, 3. C").
    *   Start with a friendly intro, like "Let's test your knowledge! Here is a short quiz:"

---
**Lesson Content:**
---
{{{courseContext}}}
---

**Student's Input/Command:**
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

    // Do not generate audio for quizzes to avoid reading out the answers.
    if (input.action === 'quiz') {
      return {
        answer: output.answer,
        suggestions: output.suggestions,
      };
    }

    const audioResponse = await textToSpeech({
        text: output.answer,
        voice: input.voice,
    });
    
    return {
        answer: output.answer,
        answerAudio: audioResponse.media,
        suggestions: output.suggestions,
    };
  }
);
