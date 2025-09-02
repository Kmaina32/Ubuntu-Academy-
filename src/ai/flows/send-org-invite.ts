
'use server';

/**
 * @fileOverview A flow for sending organization invitation emails.
 *
 * - sendOrganizationInvite - A function that handles the invitation process.
 * - SendOrgInviteInput - The input type for the function.
 * - SendOrgInviteOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit-instance';
import { createInvitation } from '@/lib/firebase-service';
import { z } from 'zod';

export const SendOrgInviteInputSchema = z.object({
  email: z.string().email().describe('The email address of the person to invite.'),
  organizationId: z.string().describe('The ID of the organization they are being invited to.'),
  organizationName: z.string().describe('The name of the organization.'),
});
export type SendOrgInviteInput = z.infer<typeof SendOrgInviteInputSchema>;

export const SendOrgInviteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendOrgInviteOutput = z.infer<typeof SendOrgInviteOutputSchema>;

export async function sendOrganizationInvite(
  input: SendOrgInviteInput
): Promise<SendOrgInviteOutput> {
  return sendOrganizationInviteFlow(input);
}

const sendOrganizationInviteFlow = ai.defineFlow(
  {
    name: 'sendOrganizationInviteFlow',
    inputSchema: SendOrgInviteInputSchema,
    outputSchema: SendOrgInviteOutputSchema,
  },
  async ({ email, organizationId, organizationName }) => {

    try {
      // 1. Create a unique invitation record in the database
      const invitationId = await createInvitation({
        email,
        organizationId,
        organizationName,
        createdAt: new Date().toISOString(),
      });

      // 2. Construct the invitation link
      const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/signup?invite=${invitationId}`;

      // 3. Generate and log the email content
      // In a real application, you would use an email service like SendGrid, Mailgun, or Resend here.
      const emailSubject = `You're invited to join ${organizationName} on Ubuntu Academy`;
      const emailBody = `
        <p>Hello,</p>
        <p>You have been invited to join the <strong>${organizationName}</strong> team on the Ubuntu Academy learning platform.</p>
        <p>Click the link below to create your account and accept the invitation:</p>
        <p><a href="${inviteLink}" style="background-color: #9D4EDD; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Join ${organizationName}</a></p>
        <p>If you have any questions, please contact your organization's administrator.</p>
        <p>Thanks,<br>The Ubuntu Academy Team</p>
      `;

      console.log("--- SIMULATED EMAIL ---");
      console.log(`To: ${email}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Body:\n${emailBody}`);
      console.log("--- END SIMULATED EMAIL ---");

      return {
        success: true,
        message: `An invitation has been sent to ${email}.`,
      };
    } catch (error) {
      console.error("Failed to send invitation:", error);
      return {
        success: false,
        message: "An internal error occurred while sending the invitation.",
      };
    }
  }
);
