// src/ai/flows/recommend-model.ts
'use server';

/**
 * @fileOverview Recommends the most suitable AI model based on past user interactions.
 *
 * - recommendModel - A function that recommends an AI model.
 * - RecommendModelInput - The input type for the recommendModel function.
 * - RecommendModelOutput - The return type for the recommendModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendModelInputSchema = z.object({
  query: z.string().describe('The user query to be processed.'),
  modelPreferences: z
    .record(z.number())
    .describe(
      'A record of the user preferences for each model, representing a record of message traffic between the client and each model.'
    ),
});
export type RecommendModelInput = z.infer<typeof RecommendModelInputSchema>;

const RecommendModelOutputSchema = z.object({
  recommendedModel: z.string().describe('The recommended AI model for the query.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence interval for the recommendation.'),
});
export type RecommendModelOutput = z.infer<typeof RecommendModelOutputSchema>;

export async function recommendModel(input: RecommendModelInput): Promise<RecommendModelOutput> {
  return recommendModelFlow(input);
}

const recommendModelPrompt = ai.definePrompt({
  name: 'recommendModelPrompt',
  input: {schema: RecommendModelInputSchema},
  output: {schema: RecommendModelOutputSchema},
  prompt: `Based on the user's query and past model preferences, recommend the most suitable AI model.

User Query: {{{query}}}
Model Preferences: {{{modelPreferences}}}

Consider the message traffic to recommend a suitable model and the confidence interval for the recommendation. Confidence must be a number between 0 and 1.

Output format: {"recommendedModel": "model_name", "confidence": 0.95}`,
});

const recommendModelFlow = ai.defineFlow(
  {
    name: 'recommendModelFlow',
    inputSchema: RecommendModelInputSchema,
    outputSchema: RecommendModelOutputSchema,
  },
  async input => {
    const {output} = await recommendModelPrompt(input);
    return output!;
  }
);
