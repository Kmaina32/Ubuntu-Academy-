
import { nextPlugin } from '@genkit-ai/next';
import '@/ai/flows/grade-short-answer-exam.ts';
import '@/ai/flows/generate-course-content.ts';
import '@/ai/flows/site-help.ts';
import '@/ai/flows/student-help.ts';
import '@/ai/flows/generate-exam.ts';
import '@/ai/flows/course-tutor.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/speech-to-text.ts';
import '@/ai/flows/mpesa-payment.ts';
import '@/ai/flows/career-coach.ts';
import '@/ai/flows/content-strategy.ts';
import '@/ai/flows/generate-api-key.ts';
import '@/ai/tools/course-catalog.ts';

export default {
  plugins: [nextPlugin()],
};
