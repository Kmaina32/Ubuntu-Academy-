// src/app/actions.ts
'use server';

// This file centralizes all server actions, providing a clear boundary
// between server and client code.

export { getLearningPath } from '@/ai/flows/career-coach';
export { runContentStrategy } from '@/ai/flows/content-strategy';
export { courseTutor } from '@/ai/flows/course-tutor';
export { generateApiKey } from '@/ai/flows/generate-api-key';
export { generateCourseContent } from '@/ai/flows/generate-course-content';
export { generateExam } from '@/ai/flows/generate-exam';
export { gradeShortAnswerExam } from '@/ai/flows/grade-short-answer-exam';
export { processMpesaPayment } from '@/ai/flows/mpesa-payment';
export { siteHelp } from '@/ai/flows/site-help';
export { speechToText } from '@/ai/flows/speech-to-text';
export { studentHelp } from '@/ai/flows/student-help';
export { textToSpeech } from '@/ai/flows/text-to-speech';
