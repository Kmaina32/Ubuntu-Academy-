
'use server';

/**
 * @fileOverview An AI career coach to generate personalized learning paths.
 *
 * - getLearningPath - A function that generates a learning path based on a career goal.
 * - LearningPathInput - The input type for the getLearningPath function.
 * - LearningPathOutput - The return type for the getLearningPath function.
 */

import { ai } from '@/ai/genkit-instance';
import { z } from 'zod';
import { listCoursesTool } from '../tools/course-catalog';
import { googleAI } from '@genkit-ai/googleai';

const LearningPathInputSchema = z.object({
  careerGoal: z.string().describe('The user\'s stated career goal.'),
});
export type LearningPathInput = z.infer<typeof LearningPathInputSchema>;

const LearningStepSchema = z.object({
  courseId: z.string().describe('The ID of the recommended course for this step.'),
  courseTitle: z.string().describe('The title of the recommended course.'),
  reasoning: z.string().describe('A detailed explanation of why this course is recommended for this step and how it contributes to the overall career goal.'),
});

const LearningPathOutputSchema = z.object({
  introduction: z.string().describe('A friendly and encouraging introduction to the learning path.'),
  learningPath: z.array(LearningStepSchema).describe('A list of courses, in order, that form the learning path.'),
  conclusion: z.string().describe('A motivating concluding statement to encourage the student to start.'),
});
export type LearningPathOutput = z.infer<typeof LearningPathOutputSchema>;

export async function getLearningPath(
  input: LearningPathInput
): Promise<LearningPathOutput> {
  return careerCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerCoachPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  tools: [listCoursesTool],
  input: { schema: LearningPathInputSchema },
  output: { schema: LearningPathOutputSchema },
  prompt: `You are an expert AI Career Coach for SkillSet Academy. Your task is to create a personalized learning path for a student based on their stated career goal.

You have access to a tool called \`listCourses\` which provides the full catalog of available courses. You MUST use this tool to see which courses are available to recommend.

**Instructions:**

1.  **Analyze the Goal:** Understand the student's career goal: "{{careerGoal}}".
2.  **Use the Tool:** Call the \`listCourses\` tool to get all available courses.
3.  **Select Courses:** Based on the student's goal and the available courses, select a logical sequence of 2-4 courses that will help them achieve their goal. Do not recommend courses that are not in the tool's output.
4.  **Create the Path:** Structure your response as a clear, step-by-step learning path. For each step:
    *   Provide the exact \`courseId\` and \`courseTitle\` from the tool's output.
    *   Provide clear, encouraging, and detailed reasoning for why that course is the right choice for that step and how it builds towards the final goal.
5.  **Write Introduction and Conclusion:** Add a friendly introduction and a motivating conclusion.

Your tone should be encouraging, professional, and empowering.`,
});

const careerCoachFlow = ai.defineFlow(
  {
    name: 'careerCoachFlow',
    inputSchema: LearningPathInputSchema,
    outputSchema: LearningPathOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
