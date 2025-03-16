import { OpenAI } from 'openai';
import AIProvider from './aiProvider.js';
import { ReviewHint, ReviewResponse } from './index.js';

export default class OpenAiClient extends AIProvider {
  public async reviewCode(codeSnippet: string, hints: ReviewHint[]): Promise<ReviewResponse> {
    const openai = new OpenAI({ apiKey: this.getApiKey() });

    const completion = await openai.chat.completions.create({
      model: this.getModel(),
      max_tokens: this.getMaxTokens(), // eslint-disable-line camelcase
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
          schema: OpenAiClient.getJsonSchema(),
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
