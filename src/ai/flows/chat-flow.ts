'use server';

/**
 * @fileOverview A chat flow that uses a specified model to generate a response.
 *
 * - generateResponse - A function that handles the chat generation process.
 * - ChatInput - The input type for the generateResponse function.
 */

import { ai } from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'genkit';
import type { Part } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  messages: z.array(MessageSchema),
  model: z.string(),
  imageUrl: z.string().optional().describe("An optional image URL as a data URI for multimodal chat."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  text: z.string(),
  imageUrl: z.string().optional(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function generateResponse(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ messages, model, imageUrl }) => {
    const lastMessageText = messages[messages.length - 1].content;
    const imageGenRegex = /^(generate|create|make|draw)\s+(an\s+)?(image|picture|photo|drawing)\s+of/i;

    if (imageGenRegex.test(lastMessageText)) {
      try {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: lastMessageText,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        return {
          text: `Here's the image you requested.`,
          imageUrl: media.url,
        };
      } catch (e: any) {
        console.error(`Error generating image`, e);
        if (e.message.includes('API key')) {
          return { text: `It seems the API key for image generation is missing or invalid. Please check your .env file.` };
        }
        return { text: 'Sorry, I was unable to generate the image.' };
      }
    }


    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));
    
    const prompt: Part[] = [{ text: lastMessageText }];
    if (imageUrl) {
      prompt.push({ media: { url: imageUrl } });
    }

    const modelRef = gemini15Flash;

    try {
      const response = await ai.generate({
        model: modelRef,
        history: history,
        prompt: prompt,
      });

      return { text: response.text };
    } catch (e: any) {
      console.error(`Error calling model ${model}`, e);
      let errorText = 'An unexpected error occurred. Please check the server logs.';
      if (e.message.includes('API key')) {
        errorText = `It seems the API key for ${model} is missing or invalid. Please check your .env file.`;
      }
      if (e.message.includes('404') || e.message.includes('permission')) {
        errorText = `The model "${model}" was not found or you may not have permission to use it. Please check the model name and your API key permissions.`;
      }
      return { text: errorText };
    }
  }
);
