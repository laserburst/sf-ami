import got from 'got';

import GitProvider from './gitProvider.js';
import { PullRequestComment } from './index.js';

export default class GitHub extends GitProvider {
  public async addPRComment(prComment: PullRequestComment): Promise<void> {
    const url = `https://api.github.com/repos/${this.getOwner()}/${this.getRepo()}/pulls/${
      prComment.prNumber
    }/comments`;
    await got.post(url, {
      json: {
        body:
          prComment.message +
          (prComment.suggestedCodeChange ? '\n\n```suggestion \n' + prComment.suggestedCodeChange + '\n```' : ''),
        path: prComment.sourceFile,
        start_line: prComment.startLine && prComment.startLine !== prComment.endLine ? prComment.startLine : undefined, // eslint-disable-line camelcase
        line: prComment.endLine && prComment.startLine !== prComment.endLine ? prComment.endLine : prComment.startLine,
        start_side: 'RIGHT', // eslint-disable-line camelcase
        side: 'RIGHT',
        commit_id: prComment.commitId, // eslint-disable-line camelcase
      },
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        Accept: 'application/vnd.github+json',
      },
      responseType: 'json',
    });
  }
}
