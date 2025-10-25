
'use server';
/**
 * @fileOverview A flow for converting text to speech.
 *
 * - textToSpeech - A function that converts a string of text into an audio data URI.
 */

import { ai } from '@/ai/genkit-instance';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/google-genai';

// Helper function to convert raw PCM audio buffer to a Base64 encoded WAV file
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export const TextToSpeechInputSchema = z.object({
  text: z.string(),
  voice: z.string().optional(),
  speed: z.number().optional(),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  media: z.string().describe("The base64-encoded WAV audio data URI."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, voice, speed }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    // The media URL is a data URI with base64 encoded PCM data
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    // Convert the PCM data to a WAV file format
    const wavBase64 = await toWav(audioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
