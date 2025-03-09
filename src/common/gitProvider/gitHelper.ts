import * as path from 'node:path';
import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';
import fse from 'fs-extra';

// SimpleGit options
const options: Partial<SimpleGitOptions> = {
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
};

export default class GitHelper {
  public static async createDirectoryWithDiff(repoDir: string, from: string, to: string): Promise<string> {
    options.baseDir = path.resolve(repoDir);
    const tmpDir: string = path.join(options.baseDir, 'tmp-diff');

    const git: SimpleGit = simpleGit(options);

    // Get changed files
    const diff = await git.diff([`${from}..${to}`, '--name-only']);
    const changedFiles = diff.split('\n').filter((file) => file && !file.includes('staticresource'));

    // Ensure temp directory is clean
    fse.removeSync(tmpDir);
    fse.ensureDirSync(tmpDir);

    // TODO: include flag to scan untracked change files as well

    // Copy changed files to tmp preserving structure
    for (const file of changedFiles) {
      const src = path.join(repoDir, file);
      const dest = path.join(tmpDir, file);

      fse.ensureDirSync(path.dirname(dest));
      fse.copySync(src, dest);
    }

    return tmpDir;
  }

  public static async verifyCommitSha(repoDir: string, commitSha: string): Promise<string> {
    options.baseDir = path.resolve(repoDir);
    const git: SimpleGit = simpleGit(options);

    const commit = await git.revparse(['--verify', commitSha]);
    return commit;
  }
}
