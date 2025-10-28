
// This file is for SERVER-SIDE use only.
// It initializes the Genkit instance with plugins that have server dependencies.
// Do NOT import this file in any client-side components.

import { genkit, Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { openAI } from '@genkit-ai/openai';

const plugins: Plugin<any>[] = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
} else if (process.env.OPENAI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Falling back to OpenAI.");
    plugins.push(openAI());
} else {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    // Only throw an error in Vercel production build
    console.error("No AI provider API keys are set in production. AI features will be disabled.");
    // Do not throw error to allow build to pass
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn("Neither GEMINI_API_KEY nor OPENAI_API_KEY are set. All AI features will be disabled.");
  }
}

export const ai = genkit({
  plugins,
});
