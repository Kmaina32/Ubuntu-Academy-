
'use server';

/**
 * @fileOverview A flow for generating and storing user API keys.
 *
 * - generateApiKey - Creates a new API key for a user.
 */

import { createApiKey } from '@/lib/firebase-service';
import type { ApiKey } from '@/lib/mock-data';
import { randomBytes } from 'crypto';
import { z } from 'zod';


const GenerateApiKeyInputSchema = z.object({
  userId: z.string().describe('The UID of the user requesting the key.'),
  keyName: z.string().describe('A descriptive name for the key.'),
});
export type GenerateApiKeyInput = z.infer<typeof GenerateApiKeyInputSchema>;

export async function generateApiKey(
    input: GenerateApiKeyInput
): Promise<ApiKey> {
    const { userId, keyName } = GenerateApiKeyInputSchema.parse(input);
    
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
