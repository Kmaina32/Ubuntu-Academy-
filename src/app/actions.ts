
'use server';

// This file centralizes all server actions, providing a clear boundary
// between server and client code. All functions exported from a 'use server' file must be async.

import type { LearningPathInput, LearningPathOutput } from '@/ai/flows/career-coach';
import type { ContentStrategyOutput } from '@/lib/mock-data';
import type { CourseTutorInput, CourseTutorOutput } from '@/ai/flows/course-tutor';
import type { GenerateApiKeyInput } from '@/ai/flows/generate-api-key';
import type { GenerateCourseContentInput, GenerateCourseContentOutput } from '@/ai/flows/generate-course-content';
import type { GenerateExamInput, GenerateExamOutput } from '@/ai/flows/generate-exam';
import type { GradeShortAnswerExamInput, GradeShortAnswerExamOutput } from '@/ai/flows/grade-short-answer-exam';
import type { MpesaPaymentInput, MpesaPaymentOutput } from '@/ai/flows/mpesa-payment';
import type { SiteHelpInput, SiteHelpOutput } from '@/ai/flows/site-help';
import type { SpeechToTextOutput } from '@/ai/flows/speech-to-text';
import type { StudentHelpInput, StudentHelpOutput } from '@/ai/flows/student-help';
import type { TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import type { ApiKey } from '@/lib/mock-data';
import type { GenerateProjectInput, GenerateProjectOutput } from '@/ai/flows/generate-project';
import type { SendOrgInviteInput, SendOrgInviteOutput } from '@/ai/flows/send-org-invite';
import type { GenerateFormalDocumentInput, GenerateFormalDocumentOutput } from '@/ai/flows/generate-document';
import { getDocument, saveDocument } from '@/lib/firebase-service';
// Removed fs/promises and path to prevent serverless function errors.

// Each function dynamically imports its corresponding flow, ensuring that the AI logic
// is only loaded on the server when the action is executed.

export async function getLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
  const { getLearningPath } = await import('@/ai/flows/career-coach');
  return getLearningPath(input);
}

export async function runContentStrategy(): Promise<ContentStrategyOutput> {
  const { runContentStrategy } = await import('@/ai/flows/content-strategy');
  return runContentStrategy();
}

export async function courseTutor(input: CourseTutorInput): Promise<CourseTutorOutput> {
  const { courseTutor } = await import('@/ai/flows/course-tutor');
  return courseTutor(input);
}

export async function generateApiKey(input: GenerateApiKeyInput): Promise<ApiKey> {
  const { generateApiKey } = await import('@/ai/flows/generate-api-key');
  return generateApiKey(input);
}

export async function generateCourseContent(input: GenerateCourseContentInput): Promise<GenerateCourseContentOutput> {
  const { generateCourseContent } = await import('@/ai/flows/generate-course-content');
  return generateCourseContent(input);
}

export async function generateExam(input: GenerateExamInput): Promise<GenerateExamOutput> {
  const { generateExam } = await import('@/ai/flows/generate-exam');
  return generateExam(input);
}

export async function generateProject(input: GenerateProjectInput): Promise<GenerateProjectOutput> {
    const { generateProject } = await import('@/ai/flows/generate-project');
    return generateProject(input);
}

export async function gradeShortAnswerExam(input: GradeShortAnswerExamInput): Promise<GradeShortAnswerExamOutput> {
  const { gradeShortAnswerExam } = await import('@/ai/flows/grade-short-answer-exam');
  return gradeShortAnswerExam(input);
}

export async function processMpesaPayment(input: MpesaPaymentInput): Promise<MpesaPaymentOutput> {
  const { processMpesaPayment } = await import('@/ai/flows/mpesa-payment');
  return processMpesaPayment(input);
}

export async function siteHelp(input: SiteHelpInput): Promise<SiteHelpOutput> {
  const { siteHelp } = await import('@/ai/flows/site-help');
  return siteHelp(input);
}

export async function speechToText(input: { audioDataUri: string }): Promise<SpeechToTextOutput> {
  const { speechToText } = await import('@/ai/flows/speech-to-text');
  // @ts-ignore
  return speechToText(input);
}

export async function studentHelp(input: StudentHelpInput): Promise<StudentHelpOutput> {
  const { studentHelp } = await import('@/ai/flows/student-help');
  return studentHelp(input);
}

export async function textToSpeech(input: { text: string; voice?: string; speed?: number; }): Promise<TextToSpeechOutput> {
    const { textToSpeech } = await import('@/ai/flows/text-to-speech');
    // @ts-ignore
    return textToSpeech(input);
}

export async function sendOrganizationInvite(input: SendOrgInviteInput): Promise<SendOrgInviteOutput> {
    const { sendOrganizationInvite } = await import('@/ai/flows/send-org-invite');
    return sendOrganizationInvite(input);
}

export async function getDocumentContent(docType: string): Promise<string> {
    // This function now *only* reads from the database.
    // If content doesn't exist, it returns an empty string to prevent errors.
    const dbContent = await getDocument(docType);
    return dbContent || '';
}


export async function saveDocumentContent(docType: string, content: string): Promise<void> {
    await saveDocument(docType, content);
}

export async function generateFormalDocument(input: GenerateFormalDocumentInput): Promise<GenerateFormalDocumentOutput> {
    const { generateFormalDocument } = await import('@/ai/flows/generate-document');
    // The flow now reads the content from the text area, not the DB or file system directly.
    const result = await generateFormalDocument(input);
    // We save the AI's output to the database.
    await saveDocument(input.docType, result.formal_document);
    return result;
}
