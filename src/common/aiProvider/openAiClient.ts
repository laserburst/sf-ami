import { OpenAI } from 'openai';
import AIProvider from './aiProvider.js';
import { OpenAiClient, ReviewHint, ReviewResponse } from './index.js';

export default class CpenAiClient extends AIProvider {
  public async reviewCode(codeSnippet: string, hints: ReviewHint[]): Promise<ReviewResponse> {
    const openai = new OpenAI({ apiKey: this.getToken() });

    const completion = await openai.chat.completions.create({
      model: this.getModel(),
      messages: [
        {
          role: 'developer',
          content: [
            {
              type: 'text',
              text: OpenAiClient.getReviewInstructions(),
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: OpenAiClient.generatePrompt(codeSnippet, hints),
            },
          ],
        },
      ],
      // eslint-disable-next-line camelcase
      response_format: {
        type: 'json_schema',
        // eslint-disable-next-line camelcase
        json_schema: {
          name: 'review_schema',
          strict: true,
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              reviews: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    startLine: {
                      type: 'integer',
                      description: 'The start line number of code block that this result is related to.',
                    },
                    endLine: {
                      type: 'integer',
                      description: 'The end line number of code block that this result is related to.',
                    },
                    comment: {
                      type: 'string',
                      description: 'A specific fix recommendation explaining the issue.',
                    },
                    codeSuggestion: {
                      type: 'string',
                      description: 'The suggested code to replace the code block.',
                    },
                    codeSuggestionType: {
                      type: 'string',
                      description: 'The type of suggestion: REPLACE, PREPEND, APPEND, or REMOVE.',
                      enum: ['REPLACE', 'PREPEND', 'APPEND', 'REMOVE'],
                    },
                  },
                  required: ['startLine', 'endLine', 'comment', 'codeSuggestion', 'codeSuggestionType'],
                  additionalProperties: false,
                },
              },
            },
            required: ['reviews'],
            additionalProperties: false,
          },
        },
      },
      store: true,
    });

    const content = completion.choices[0].message.content;
    if (content === null) {
      throw new Error('OpenAI response content is null');
    }
    return JSON.parse(content) as ReviewResponse;
  }
}
