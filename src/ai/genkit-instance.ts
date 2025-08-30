// This file is for SERVER-SIDE use only.
// It initializes the Genkit instance with plugins that have server dependencies.
// Do NOT import this file in any client-side components.

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const plugins = [];

if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    plugins.push(googleAI());
} else {
    if (process.env.NODE_ENV === 'production') {
        // In production, we should fail hard if the key is missing.
        throw new Error("GEMINI_API_KEY is not set. AI features will be disabled. Please set this environment variable in your Vercel project settings.");
    } else {
        // In development, a warning is sufficient.
        console.warn("GEMINI_API_KEY is not set. Genkit Google AI plugin will be disabled.");
    }
}

export const ai = genkit({
  plugins,
});
