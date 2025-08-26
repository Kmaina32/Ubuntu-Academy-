
'use server';

/**
 * @fileOverview A flow for generating and storing user API keys.
 *
 * - generateApiKey - Creates a new API key for a user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createApiKey } from '@/lib/firebase-service';
import type { ApiKey } from '@/lib/mock-data';
import { randomBytes } from 'crypto';

const GenerateApiKeyInputSchema = z.object({
  userId: z.string().describe('The UID of the user requesting the key.'),
  keyName: z.string().describe('A descriptive name for the key.'),
});
export type GenerateApiKeyInput = z.infer<typeof GenerateApiKeyInputSchema>;

const GenerateApiKeyOutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    key: z.string(),
    createdAt: z.string(),
});

export async function generateApiKey(
    input: GenerateApiKeyInput
): Promise<ApiKey> {
  return generateApiKeyFlow(input);
}


const generateApiKeyFlow = ai.defineFlow(
  {
    name: 'generateApiKeyFlow',
    inputSchema: GenerateApiKeyInputSchema,
    outputSchema: GenerateApiKeyOutputSchema,
  },
  async ({ userId, keyName }) => {
    // Generate a secure, random string for the key
    const key = `sk_live_${randomBytes(24).toString('hex')}`;
    
    const newKeyData: Omit<ApiKey, 'id'> = {
        name: keyName,
        key: key,
        createdAt: new Date().toISOString(),
        userId: userId,
    };
    
    // Save the key to the database
    const keyId = await createApiKey(userId, newKeyData);

    return {
        ...newKeyData,
        id: keyId,
    };
  }
);
