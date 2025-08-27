// This file is for SERVER-SIDE use only.
// It initializes the Genkit instance with plugins that have server dependencies.
// Do NOT import this file in any client-side components.

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const plugins = [];

if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
} else {
    // This warning will appear in the server console during development
    console.warn("GEMINI_API_KEY is not set. Genkit Google AI plugin will be disabled.");
}

export const ai = genkit({
  plugins,
});
