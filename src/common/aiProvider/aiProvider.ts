import { reviewInstructions, reviewPrompt } from './aiPrompts.js';
import { ReviewHint, ReviewResponse } from './index.js';

const jsonSchema = {
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
};
export default abstract class AIProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number = 5120;

  public constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  protected static generatePrompt(codeSnippet: string, hints: ReviewHint[]): string {
    const hintsText = hints.map((hint) => AIProvider.formatHints(hint)).join('\n');

    // eslint-disable-next-line no-console
    console.log(`${reviewPrompt}\n\n# Code Snippet:\n${codeSnippet}\n\n# Hints:\n${hintsText}`);

    return `${reviewPrompt}\n\n# Code Snippet:\n${codeSnippet}\n\n# Hints:\n${hintsText}`;
  }

  protected static getReviewInstructions(): string {
    return reviewInstructions;
  }

  protected static getJsonSchema(): typeof jsonSchema {
    return jsonSchema;
  }

  private static formatHints(hint: ReviewHint): string {
    return `- ${hint.ruleId}: ${hint.message}\n  - Region\n    - StartLine: ${
      hint.region.startLine ?? ''
    }\n    - EndLine: ${hint.region.endLine ?? ''}\n    - StartColumn: ${
      hint.region.startColumn ?? ''
    }\n    - EndColumn: ${hint.region.endColumn ?? ''}`;
  }

  public getModel(): string {
    return this.model;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public getMaxTokens(): number {
    return this.maxTokens;
  }
  public setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }

  public abstract reviewCode(codeSnippet: string, hints: ReviewHint[]): Promise<ReviewResponse>;
}
