
// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview An AI agent for generating a course exam.
 *
 * - generateExam - A function that handles the exam generation process.
 * - GenerateExamInput - The input type for the generateExam function.
 * - GenerateExamOutput - The return type for the generateExam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseDescription: z.string().describe('A description of the course content to base the exam on.'),
});
export type GenerateExamInput = z.infer<typeof GenerateExamInputSchema>;

const ShortAnswerQuestionSchema = z.object({
    id: z.string().describe("A unique identifier for the question, e.g., 'q-1'."),
    type: z.string().describe("The type of the question, either 'short-answer' or 'multiple-choice'."),
    question: z.string().describe('The exam question.'),
    referenceAnswer: z.string().describe('The detailed, correct reference answer for the exam question.'),
    maxPoints: z.number().describe('The maximum points possible for the exam question, always set to 10.'),
});

const MultipleChoiceQuestionSchema = z.object({
    id: z.string().describe("A unique identifier for the question, e.g., 'q-2'."),
    type: z.string().describe("The type of the question, either 'short-answer' or 'multiple-choice'."),
    question: z.string().describe('The exam question.'),
    options: z.array(z.string()).length(4).describe('An array of 4 possible answers for the question.'),
    correctAnswer: z.number().min(0).max(3).describe('The index of the correct answer in the options array.'),
    maxPoints: z.number().describe('The maximum points possible for the exam question, always set to 10.'),
});

const ExamQuestionSchema = z.union([ShortAnswerQuestionSchema, MultipleChoiceQuestionSchema]);

const GenerateExamOutputSchema = z.object({
  exam: z.array(ExamQuestionSchema).min(5).describe('The final exam for the course, containing at least five questions.'),
});
export type GenerateExamOutput = z.infer<typeof GenerateExamOutputSchema>;

export async function generateExam(
  input: GenerateExamInput
): Promise<GenerateExamOutput> {
  return generateExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExamPrompt',
  input: {schema: GenerateExamInputSchema},
  output: {schema: GenerateExamOutputSchema},
  prompt: `You are an expert curriculum developer. Your task is to generate a final exam for an online course based on its title and description.

The exam must be overly comprehensive and rigorously test the core concepts of the course. It absolutely must include at least five questions, with a mix of short-answer and multiple-choice questions. Do not generate fewer than five questions.

Course Title: {{{courseTitle}}}
Course Description: {{{courseDescription}}}

Please generate the full exam now. Ensure that multiple-choice questions have exactly four options and a correct answer index, and short-answer questions have a detailed reference answer. The exam must contain a minimum of five questions.`,
});

const generateExamFlow = ai.defineFlow(
  {
    name: 'generateExamFlow',
    inputSchema: GenerateExamInputSchema,
    outputSchema: GenerateExamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
