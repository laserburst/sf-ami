import { PullRequestComment, GitProvider } from '../../src/common/gitProvider/index.js';

export class MockGitProvider extends GitProvider {
  private lastComment?: PullRequestComment;

  public constructor() {
    super('fake-token', 'fake-owner', 'fake-repo');
  }

  public override async addPRComment(prCommentRequest: PullRequestComment): Promise<void> {
    this.lastComment = prCommentRequest;
  }

  public getLastComment(): PullRequestComment | undefined {
    return this.lastComment;
  }
}
