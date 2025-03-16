import { Anthropic } from '@anthropic-ai/sdk';
import AIProvider from './aiProvider.js';
import { ReviewHint, ReviewResponse } from './index.js';

export default class AnthropicAiClient extends AIProvider {
  public async reviewCode(codeSnippet: string, hints: ReviewHint[]): Promise<ReviewResponse> {
    const anthropic = new Anthropic({ apiKey: this.getApiKey() });

    const message = await anthropic.messages.create({
      model: this.getModel(),
      max_tokens: this.getMaxTokens(), // eslint-disable-line camelcase
      system: AnthropicAiClient.getReviewInstructions(),
      messages: [
        {
          role: 'assistant',
          content:
            'Response **should be a valid JSON**, **without any formating** and following below JSON Schema:\n ' +
            JSON.stringify(AnthropicAiClient.getJsonSchema()),
        },
        { role: 'user', content: AnthropicAiClient.generatePrompt(codeSnippet, hints) },
      ],
    });

    // get result from message response and return it
    const content: string = (message.content[0] as { text: string }).text;

    // eslint-disable-next-line no-console
    console.log(content);

    return JSON.parse(content) as ReviewResponse;
  }
}
