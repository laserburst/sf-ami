export { default as GitHelper } from './gitHelper.js';
export { default as GitProvider } from './gitProvider.js';
export { default as GitProviderFactory } from './gitProviderFactory.js';
export { default as GitHub } from './gitHub.js';

export enum GitProviderType {
  GitHub = 'GitHub',
}

export declare type PullRequestComment = {
  prNumber: string;
  commitId: string;
  message: string;
  suggestedCodeChange: string;
  startLine: number;
  endLine: number;
  sourceFile: string;
};
