
'use server';

/**
 * @fileOverview An AI agent for generating a course final project.
 *
 * - generateProject - A function that handles the project generation process.
 * - GenerateProjectInput - The input type for the generateProject function.
 * - GenerateProjectOutput - The return type for the generateProject function.
 */

import { ai } from '@/ai/genkit-instance';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { Project } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export const GenerateProjectInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseDescription: z.string().describe('A description of the course content to base the project on.'),
});
export type GenerateProjectInput = z.infer<typeof GenerateProjectInputSchema>;

const ProjectSchema = z.object({
    id: z.string().describe("A unique identifier for the project, e.g., 'proj-1'."),
    title: z.string().describe('A clear and concise title for the final project.'),
    description: z.string().describe('A detailed description of the project, including requirements, goals, and steps to complete.'),
});

export const GenerateProjectOutputSchema = z.object({
  project: ProjectSchema.describe('The final project for the course.'),
});
export type GenerateProjectOutput = z.infer<typeof GenerateProjectOutputSchema>;

export async function generateProject(
  input: GenerateProjectInput
): Promise<GenerateProjectOutput> {
  return generateProjectFlow(input);
}

// Define a schema for the AI's output, without the ID field.
const AiProjectOutputSchema = z.object({
  title: z.string().describe('A clear and concise title for the final project.'),
  description: z.string().describe('A detailed description of the project, including requirements, goals, and steps to complete.'),
});

const prompt = ai.definePrompt({
  name: 'generateProjectPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: GenerateProjectInputSchema},
  output: {schema: AiProjectOutputSchema}, // Use the schema without the ID for the AI output
  prompt: `You are an expert curriculum developer. Your task is to generate a final project for an online course based on its title and description.

The project should be practical, hands-on, and allow students to apply the skills they've learned throughout the course.

Course Title: {{{courseTitle}}}
Course Description: {{{courseDescription}}}

Please generate a single, comprehensive final project with a title and detailed description.`,
});

const generateProjectFlow = ai.defineFlow(
  {
    name: 'generateProjectFlow',
    inputSchema: GenerateProjectInputSchema,
    outputSchema: GenerateProjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Could not generate a project.');
    }
    
    // Add the ID to the AI's output to match the final required schema
    const projectWithId: Project = {
        ...output,
        id: `proj-${uuidv4()}`,
    };

    return { project: projectWithId };
  }
);
