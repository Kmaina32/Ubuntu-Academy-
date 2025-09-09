// This is a "safe" entry point for Genkit that can be imported by client components.
// It should not initialize any plugins that have server-side dependencies.

// We export the type and a flag to check if AI features are configured.
// The actual AI instance is created in a separate, server-only file.

import { genkit } from 'genkit';

// This check needs to align with the server-side check in genkit-instance.ts
export const isConfigured = !!process.env.GEMINI_API_KEY || !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export type AI = ReturnType<typeof genkit<any>>;
