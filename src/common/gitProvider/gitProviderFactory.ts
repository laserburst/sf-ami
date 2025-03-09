import { GitHub, GitProvider, GitProviderType } from './index.js';

export default class GitProviderFactory {
  public static getInstance(providerType: GitProviderType, token: string, owner: string, repo: string): GitProvider {
    switch (providerType) {
      case GitProviderType.GitHub:
        return new GitHub(token, owner, repo);
      default:
        throw new Error('Unsupported Git provider type');
    }
  }
}
