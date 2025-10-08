
'use server';

/**
 * @fileOverview A flow for creating organization invitation links.
 *
 * - createOrganizationInvite - A function that creates an invitation record.
 * - CreateOrgInviteInput - The input type for the function.
 * - CreateOrgInviteOutput - The return type for the function.
 */

import { createInvitation } from '@/lib/firebase-service';
import { z } from 'zod';
import { ai } from '@/ai/genkit-instance';

export const CreateOrgInviteInputSchema = z.object({
  email: z.string().email().describe('The email address of the person to invite.'),
  organizationId: z.string().describe('The ID of the organization they are being invited to.'),
  organizationName: z.string().describe('The name of the organization.'),
});
export type CreateOrgInviteInput = z.infer<typeof CreateOrgInviteInputSchema>;

export const CreateOrgInviteOutputSchema = z.object({
  success: z.boolean(),
  inviteId: z.string().optional(),
  message: z.string(),
});
export type CreateOrgInviteOutput = z.infer<typeof CreateOrgInviteOutputSchema>;

export async function createOrganizationInvite(
  input: CreateOrgInviteInput
): Promise<CreateOrgInviteOutput> {
  return createOrganizationInviteFlow(input);
}

const createOrganizationInviteFlow = ai.defineFlow(
  {
    name: 'createOrganizationInviteFlow',
    inputSchema: CreateOrgInviteInputSchema,
    outputSchema: CreateOrgInviteOutputSchema,
  },
  async ({ email, organizationId, organizationName }) => {
    try {
      // Create an invitation document in the database
      const inviteId = await createInvitation({
        email,
        organizationId,
        organizationName,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        inviteId: inviteId,
        message: 'Invitation created successfully. Share the link with the user.',
      };
    } catch (error: any) {
      console.error("Failed to create invitation:", error);
      return {
        success: false,
        message: 'An internal error occurred while creating the invitation.',
      };
    }
  }
);
