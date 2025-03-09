import { Region } from 'sarif';

export { default as AIProvider } from './aiProvider.js';
export { default as AIProviderFactory } from './aiProviderFactory.js';
export { default as OpenAiClient } from './openAiClient.js';

export enum AIProviderType {
  OpenAI = 'OpenAI',
}

export declare type ReviewHint = {
  ruleId: string;
  message: string;
  region: Region;
};

export declare type ReviewResponse = {
  reviews: [
    {
      startLine: number;
      endLine: number;
      comment: string;
      codeSuggestion: string;
      codeSuggestionType: string;
    }
  ];
};
