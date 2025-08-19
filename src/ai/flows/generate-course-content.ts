// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview An AI agent for generating full course content.
 *
 * - generateCourseContent - A function that handles the course generation process.
 * - GenerateCourseContentInput - The input type for the generateCourseContent function.
 * - GenerateCourseContentOutput - The return type for the generateCourseContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseContentInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course to be generated.'),
  courseContext: z.string().optional().describe('A rich text context containing course material, including potential YouTube links.'),
});
export type GenerateCourseContentInput = z.infer<typeof GenerateCourseContentInputSchema>;

const YoutubeLinkSchema = z.object({
    title: z.string().describe('The title of the YouTube video.'),
    url: z.string().url().describe('The URL of the YouTube video.'),
});

const LessonSchema = z.object({
    id: z.string().describe("A unique identifier for the lesson, e.g., 'lesson-1'."),
    title: z.string().describe('The title of the lesson.'),
    duration: z.string().describe("The estimated duration of the lesson, e.g., '5 min' or '10 min'."),
    content: z.string().describe('The full, extensive, and detailed content of the lesson text. It should be comprehensive and provide in-depth information.'),
    youtubeLinks: z.array(YoutubeLinkSchema).describe('An array of relevant YouTube links for this lesson. Extract these from the course context if available.'),
});

const ModuleSchema = z.object({
    id: z.string().describe("A unique identifier for the module, e.g., 'module-1'."),
    title: z.string().describe('The title of the module.'),
    lessons: z.array(LessonSchema).min(1).describe('An array of lessons for this module.'),
});

const ExamSchema = z.object({
    question: z.string().describe('The final exam question.'),
    referenceAnswer: z.string().describe('The detailed, correct reference answer for the exam question.'),
    maxPoints: z.number().describe('The maximum points possible for the exam question, always set to 10.'),
});

const GenerateCourseContentOutputSchema = z.object({
  longDescription: z.string().min(100).describe('A detailed, comprehensive description of the entire course.'),
  modules: z.array(ModuleSchema).min(2).describe('An array of modules for the course. Should contain at least 2 modules.'),
  exam: ExamSchema.describe('The final exam for the course.'),
});
export type GenerateCourseContentOutput = z.infer<typeof GenerateCourseContentOutputSchema>;

export async function generateCourseContent(
  input: GenerateCourseContentInput
): Promise<GenerateCourseContentOutput> {
  return generateCourseContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseContentPrompt',
  input: {schema: GenerateCourseContentInputSchema},
  output: {schema: GenerateCourseContentOutputSchema},
  prompt: `You are an expert curriculum developer for an online learning platform in Kenya. Your task is to generate a complete and overly extensive course structure based on a given title and context.

The course should be extremely comprehensive and well-structured. It must include a detailed long description, at least two modules, and a total of at least five lessons distributed across the modules. It must also include a final exam.

Course Title: {{{courseTitle}}}

{{#if courseContext}}
Use the following context as the primary source of information. Extract key topics for modules and lessons, and most importantly, extract any YouTube URLs to include in the relevant lessons.
Course Context:
{{{courseContext}}}
{{/if}}

Please generate the following content:
1.  **Long Description**: A detailed description of what the course is about, who it's for, and what students will learn. Minimum 100 characters.
2.  **Modules**: A list of modules. Each module must have a unique ID, a title, and a list of lessons.
3.  **Lessons**: A list of lessons for each module. Each lesson must have a unique ID, a title, an estimated duration (e.g., "5 min"), and the full, overly extensive lesson content. The content should be very detailed. For each lesson, extract relevant YouTube links from the context and add them to the 'youtubeLinks' field. If no relevant links are in the context for a lesson, provide an EMPTY array.
4.  **Exam**: A final exam with a single question, a detailed reference answer for grading, and a max score of 10 points.

Generate the full course structure now.`,
});

const generateCourseContentFlow = ai.defineFlow(
  {
    name: 'generateCourseContentFlow',
    inputSchema: GenerateCourseContentInputSchema,
    outputSchema: GenerateCourseContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
