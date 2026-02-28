'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Node 18+ already has fetch → no need for node-fetch

/* ------------------ TOOL SCHEMAS ------------------ */

const WikipediaSearchToolInputSchema = z.object({
  query: z.string().describe('The search query for Wikipedia.'),
});

const WikipediaSearchResultSchema = z.object({
  title: z.string(),
  extract: z.string(),
  url: z.string().url(),
});

const WikipediaSearchToolOutputSchema = z.array(
  WikipediaSearchResultSchema
);

/* ------------------ WIKIPEDIA TOOL ------------------ */

const wikipediaSearchTool = ai.defineTool(
  {
    name: 'wikipediaSearch',
    description:
      'Searches Wikipedia for articles related to the query and returns summaries.',
    inputSchema: WikipediaSearchToolInputSchema,
    outputSchema: WikipediaSearchToolOutputSchema,
  },

  async (input) => {
    const { query } = input;

    try {
      // Wikipedia search API
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(
        query
      )}&srlimit=3`;

      const searchResponse = await fetch(searchUrl);
      const searchData: any = await searchResponse.json();

      if (
        !searchData?.query?.search ||
        searchData.query.search.length === 0
      ) {
        return [];
      }

      const results = [];

      for (const result of searchData.query.search) {
        const title = result.title;

        // summary API (simpler + reliable)
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          title
        )}`;

        const summaryRes = await fetch(summaryUrl);
        const summaryData: any = await summaryRes.json();

        results.push({
          title,
          extract: summaryData.extract || '',
          url: summaryData.content_urls?.desktop?.page || '',
        });
      }

      return results;
    } catch (error) {
      console.error('Wikipedia fetch error:', error);
      return [];
    }
  }
);

/* ------------------ FLOW SCHEMAS ------------------ */

const AnswerQuestionWithWikipediaInputSchema = z.object({
  question: z.string(),
});

const AnswerQuestionWithWikipediaOutputSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
});

export type AnswerQuestionWithWikipediaInput = z.infer<
  typeof AnswerQuestionWithWikipediaInputSchema
>;

export type AnswerQuestionWithWikipediaOutput = z.infer<
  typeof AnswerQuestionWithWikipediaOutputSchema
>;

/* ------------------ FLOW ------------------ */

const answerQuestionWithWikipediaFlow = ai.defineFlow(
  {
    name: 'answerQuestionWithWikipediaFlow',
    inputSchema: AnswerQuestionWithWikipediaInputSchema,
    outputSchema: AnswerQuestionWithWikipediaOutputSchema,
  },

  async (input) => {
    const results = await wikipediaSearchTool({
      query: input.question,
    });

    if (results.length === 0) {
      return {
        answer: 'No Wikipedia results found.',
        sources: [],
      };
    }

    return {
      answer: results[0].extract,
      sources: results.map((r) => r.url),
    };
  }
);

/* ------------------ EXPORTED FUNCTION ------------------ */

export async function answerQuestionWithWikipedia(
  input: AnswerQuestionWithWikipediaInput
): Promise<AnswerQuestionWithWikipediaOutput> {
  return answerQuestionWithWikipediaFlow(input);
}