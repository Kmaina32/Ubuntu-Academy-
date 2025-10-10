
'use server';

// This file centralizes all server actions, providing a clear boundary
// between server and client code. All functions exported from a 'use server' file must be async.

import type { LearningPathInput, LearningPathOutput } from '@/ai/flows/career-coach';
import type { ContentStrategyOutput, CardPaymentInput, PayPalPaymentInput } from '@/lib/types';
import type { CourseTutorInput, CourseTutorOutput } from '@/ai/flows/course-tutor';
import type { GenerateApiKeyInput } from '@/ai/flows/generate-api-key';
import type { GenerateCourseContentInput, GenerateCourseContentOutput } from '@/ai/flows/generate-course-content';
import type { GenerateExamInput, GenerateExamOutput } from '@/ai/flows/generate-exam';
import type { GradeShortAnswerExamInput, GradeShortAnswerExamOutput } from '@/ai/flows/grade-short-answer-exam';
import type { MpesaPaymentInput, MpesaPaymentOutput } from '@/ai/flows/mpesa-payment';
import type { SiteHelpInput, SiteHelpOutput } from '@/ai/flows/site-help';
import type { SpeechToTextOutput } from '@/ai/flows/speech-to-text';
import type { ApiKey } from '@/lib/types';
import type { GenerateProjectInput, GenerateProjectOutput } from '@/ai/flows/generate-project';
import type { CreateOrgInviteInput as SendOrgInviteInput, CreateOrgInviteOutput as SendOrgInviteOutput } from '@/ai/flows/send-org-invite';
import type { GenerateFormalDocumentInput, GenerateFormalDocumentOutput } from '@/ai/flows/generate-document';
import type { GenerateHackathonIdeasInput, GenerateHackathonIdeasOutput } from '@/ai/flows/generate-hackathon-ideas';
import type { TextToSpeechOutput, TextToSpeechInput } from '@/ai/flows/text-to-speech';

import fs from 'fs/promises';
import path from 'path';

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

// Placeholder for card payment processing
export async function processCardPayment(input: CardPaymentInput): Promise<{ success: boolean; message: string }> {
    console.log('Simulating card payment for:', input);
    // In a real app, you would integrate with Stripe here using the secret key.
    // This is a placeholder that simulates a successful payment.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return {
        success: true,
        message: 'Card payment processed successfully.',
    };
}

// Placeholder for PayPal payment processing
export async function processPayPalPayment(input: PayPalPaymentInput): Promise<{ success: boolean; message: string; approvalUrl?: string }> {
    console.log('Simulating PayPal payment for:', input);
    // In a real app, you would make an API call to PayPal to create a payment order.
    // This would return an approval URL to redirect the user to.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return {
        success: true,
        message: 'PayPal order created. Redirecting for approval...',
        approvalUrl: `/payment-success?item=${input.itemName}`, // Simulate a redirect URL
    };
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

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    const { textToSpeechFlow } = await import('@/ai/flows/text-to-speech');
    return textToSpeechFlow(input);
}

export async function sendOrganizationInvite(input: SendOrgInviteInput): Promise<SendOrgInviteOutput> {
    const { createOrganizationInvite } = await import('@/ai/flows/send-org-invite');
    return createOrganizationInvite(input);
}

// Document Management Actions
const getDocPath = (docType: string) => {
    return path.join(process.cwd(), 'src', 'markdown_files', docType);
}

export async function getDocumentContent(docType: string): Promise<string> {
    try {
        const filePath = getDocPath(docType);
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error(`Failed to read document ${docType}:`, error);
        return `# Error: Could not load ${docType}`;
    }
}

export async function saveDocumentContent(docType: string, content: string): Promise<void> {
    try {
        const filePath = getDocPath(docType);
        await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
        console.error(`Failed to save document ${docType}:`, error);
        throw new Error(`Could not save ${docType}`);
    }
}

export async function generateFormalDocument(input: { docType: string; content: string; }): Promise<GenerateFormalDocumentOutput> {
    const { generateFormalDocument } = await import('@/ai/flows/generate-document');
    const result = await generateFormalDocument({ docType: input.docType as any, content: input.content });
    // The result is returned to the client, which will then call saveDocumentContent.
    return result;
}

export async function generateHackathonIdeas(input: GenerateHackathonIdeasInput): Promise<GenerateHackathonIdeasOutput> {
    const { generateHackathonIdeas } = await import('@/ai/flows/generate-hackathon-ideas');
    return generateHackathonIdeas(input);
}
