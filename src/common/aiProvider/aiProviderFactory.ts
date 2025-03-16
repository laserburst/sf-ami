import { OpenAiClient, AIProvider, AIProviderType, AnthropicAiClient } from './index.js';

export default class GitProviderFactory {
  public static getInstance(providerType: AIProviderType, token: string, model: string): AIProvider {
    switch (providerType) {
      case AIProviderType.OpenAI:
        return new OpenAiClient(token, model);
      case AIProviderType.Anthropic:
        return new AnthropicAiClient(token, model);
      default:
        throw new Error('Unsupported AI provider type');
    }
  }
}
