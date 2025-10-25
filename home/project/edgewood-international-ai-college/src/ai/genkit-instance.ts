
// This file is for SERVER-SIDE use only.
// It initializes the Genkit instance with plugins that have server dependencies.
// Do NOT import this file in any client-side components.

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { openAI } from '@genkit-ai/openai';

const plugins = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
} else if (process.env.OPENAI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Falling back to OpenAI.");
    plugins.push(openAI());
} else {
  if (process.env.NODE_ENV === 'production') {
    console.error("No AI provider API keys are set in production. AI features will be disabled.");
  } else {
    console.warn("Neither GEMINI_API_KEY nor OPENAI_API_KEY are set. All AI features will be disabled.");
  }
}

if(plugins.length === 0 && process.env.NODE_ENV === 'production') {
    throw new Error("No AI provider API keys are set in production. AI features will be disabled.");
}

export const ai = genkit({
  plugins,
});
