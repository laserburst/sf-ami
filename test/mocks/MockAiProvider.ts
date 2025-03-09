import { AIProvider, ReviewHint, ReviewResponse } from '../../src/common/aiProvider/index.js';

export class MockAiProvider extends AIProvider {
  private lastReview = '';

  public constructor() {
    super('fake-token', 'fake-model');
  }

  public override async reviewCode(codeSnippet: string, hints: ReviewHint[]): Promise<ReviewResponse> {
    this.lastReview = `Code reviewed: ${codeSnippet.substring(0, 10)}... with ${hints.length} hints`;
    return {
      reviews: [
        {
          startLine: 1,
          endLine: 1,
          comment: 'Hey Honey, code looks great!',
          codeSuggestion: '',
          codeSuggestionType: '',
        },
      ],
    };
  }

  public getLastReview(): string {
    return this.lastReview;
  }
}
