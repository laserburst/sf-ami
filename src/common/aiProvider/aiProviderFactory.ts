import { OpenAiClient, AIProvider, AIProviderType } from './index.js';

export default class GitProviderFactory {
  public static getInstance(providerType: AIProviderType, token: string, model: string): AIProvider {
    switch (providerType) {
      case AIProviderType.OpenAI:
        return new OpenAiClient(token, model);
      default:
        throw new Error('Unsupported AI provider type');
    }
  }
}
