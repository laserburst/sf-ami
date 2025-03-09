import { reviewInstructions, reviewPrompt } from './aiPrompts.js';
import { ReviewHint, ReviewResponse } from './index.js';

export default abstract class AIProvider {
  private token: string;
  private model: string;

  public constructor(token: string, model: string) {
    this.token = token;
    this.model = model;
  }

  protected static generatePrompt(codeSnippet: string, hints: ReviewHint[]): string {
    const hintsText = hints.map((hint) => AIProvider.formatHints(hint)).join('\n');
    return `${reviewPrompt}\n\n# Code Snippet:\n${codeSnippet}\n\n# Hints:\n${hintsText}`;
  }

  protected static getReviewInstructions(): string {
    return reviewInstructions;
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

  public getToken(): string {
    return this.token;
  }

  public abstract reviewCode(codeSnippet: string, hints: ReviewHint[]): Promise<ReviewResponse>;
}
