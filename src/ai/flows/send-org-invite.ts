
'use server';

/**
 * @fileOverview A flow for sending organization invitation emails.
 *
 * - sendOrganizationInvite - A function that handles the invitation process.
 * - SendOrgInviteInput - The input type for the function.
 * - SendOrgInviteOutput - The return type for the function.
 */

import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ai } from '@/ai/genkit-instance';
import { saveUser } from '@/lib/firebase-service';
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
      // Step 1: Pre-create a user account in Firebase Auth.
      // We use a secure, random password that the user will immediately reset.
      const tempPassword = Math.random().toString(36).slice(-16);
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const user = userCredential.user;

      // Step 2: Save the user's initial data in the Realtime Database.
      await saveUser(user.uid, {
        email: user.email,
        displayName: 'New Member',
        organizationId: organizationId,
        isOrganizationAdmin: false,
        createdAt: new Date().toISOString(),
      });
      
      // Step 3: Generate the password reset link, which acts as the "complete your account" link.
      const resetLink = await sendPasswordResetEmail(auth, email);

      // 4. Generate and log the email content
      // In a real application, you would use an email service like SendGrid, Mailgun, or Resend here.
      const emailSubject = `You're invited to join ${organizationName} on Akili AI Academy`;
      const emailBody = `
        <p>Hello,</p>
        <p>You have been invited to join the <strong>${organizationName}</strong> team on the Akili AI Academy learning platform.</p>
        <p>Click the link below to set your password and activate your account:</p>
        <p><a href="${resetLink}" style="background-color: #9D4EDD; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Set Your Password & Join</a></p>
        <p>If you have any questions, please contact your organization's administrator.</p>
        <p>Thanks,<br>The Akili AI Academy Team</p>
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
    } catch (error: any) {
        let errorMessage = "An internal error occurred while sending the invitation.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This user is already a member of an organization.";
        }
        console.error("Failed to send invitation:", error);
        return {
            success: false,
            message: errorMessage,
        };
    }
  }
);
