import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins = [];

if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
} else {
    console.warn("GEMINI_API_KEY is not set. Genkit Google AI plugin will be disabled.");
}

export const ai = genkit({
  plugins,
});

export const isConfigured = plugins.length > 0;
