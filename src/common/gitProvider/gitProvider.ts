import { PullRequestComment } from './index.js';

export default abstract class GitProvider {
  private token: string;
  private owner: string;
  private repo: string;

  public constructor(token: string, owner: string, repo: string) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
  }

  protected getOwner(): string {
    return this.owner;
  }

  protected getRepo(): string {
    return this.repo;
  }

  protected getToken(): string {
    return this.token;
  }

  public abstract addPRComment(prCommentRequest: PullRequestComment): Promise<void>;
}
