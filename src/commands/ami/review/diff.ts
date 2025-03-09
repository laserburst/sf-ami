/* eslint-disable no-console */
import * as path from 'node:path';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fse from 'fs-extra';
import { Log, Region, Location } from 'sarif';
import {
  GitHelper,
  GitProvider,
  GitProviderFactory,
  GitProviderType,
  PullRequestComment,
} from '../../../common/gitProvider/index.js';
import { SCATProviderFactory, SCATProviderType } from '../../../common/contextProviders/scat/index.js';
import { AIProviderFactory, AIProviderType, ReviewHint, ReviewResponse } from '../../../common/aiProvider/index.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-ami', 'ami.review.diff');

export default class AmiReviewDiff extends SfCommand<void> {
  public static override readonly summary = messages.getMessage('summary');
  public static override readonly description = messages.getMessage('description');
  public static override readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'repo-dir': Flags.directory({
      summary: messages.getMessage('flags.repo-dir.summary'),
      char: 'r',
      default: process.cwd(),
      exists: true,
      required: false,
    }),
    from: Flags.string({
      summary: messages.getMessage('flags.from.summary'),
      char: 'f',
      default: 'HEAD~1',
      required: false,
    }),
    to: Flags.string({
      summary: messages.getMessage('flags.to.summary'),
      char: 't',
      default: 'HEAD',
      required: false,
    }),
    'pull-request-id': Flags.string({
      summary: messages.getMessage('flags.pull-request-id.summary'),
      char: 'p',
      required: false,
    }),
    'config-file': Flags.file({
      summary: messages.getMessage('flags.config-file.summary'),
      char: 'c',
      exists: true,
    }),
    'ai-provider': Flags.option({
      summary: messages.getMessage('flags.ai-provider.summary'),
      char: 'a',
      required: true,
      multiple: false,
      options: ['OpenAI'] as const,
    })(),
    'ai-token': Flags.string({
      summary: messages.getMessage('flags.ai-token.summary'),
      char: 'n',
      required: true,
    }),
    'ai-model': Flags.string({
      summary: messages.getMessage('flags.ai-model.summary'),
      char: 'm',
      required: true,
    }),
    'git-provider': Flags.option({
      summary: messages.getMessage('flags.git-provider.summary'),
      char: 'g',
      required: false,
      multiple: false,
      options: ['GitHub'] as const,
    })(),
    'git-token': Flags.string({
      summary: messages.getMessage('flags.git-token.summary'),
      char: 'k',
      required: false,
    }),
    'git-owner': Flags.string({
      summary: messages.getMessage('flags.git-owner.summary'),
      char: 'w',
      required: false,
    }),
    'git-repo': Flags.string({
      summary: messages.getMessage('flags.git-repo.summary'),
      char: 'e',
      required: false,
    }),
  };
  public async run(): Promise<void> {
    const flags = (await this.parse(AmiReviewDiff)).flags;
    const repoDir = flags['repo-dir'];
    const aiProvider = AIProviderFactory.getInstance(
      flags['ai-provider'] as AIProviderType,
      flags['ai-token'],
      flags['ai-model']
    );
    let gitProvider: GitProvider;

    if (flags['git-provider'] && flags['git-token'] && flags['git-owner'] && flags['git-repo']) {
      gitProvider = GitProviderFactory.getInstance(
        flags['git-provider'] as GitProviderType,
        flags['git-token'],
        flags['git-owner'],
        flags['git-repo']
      );
    }

    // Get difference between two commits in a temprorary directory
    const diffDir = await GitHelper.createDirectoryWithDiff(repoDir, flags.from, flags.to);

    // Run the code analyzer on the diff directory
    const codeAnalyzer = SCATProviderFactory.getInstance(
      SCATProviderType.SFCodeAnalyzer,
      diffDir,
      flags['config-file']
    );
    const sarifData: Log = await codeAnalyzer.run(diffDir);

    const fileMap: Map<string, ReviewHint[]> = new Map();

    sarifData.runs.forEach((run) => {
      run.results?.forEach((result) => {
        if (!result.ruleId || !result.message?.text || !result.locations) return;

        result.locations?.forEach((location: Location) => {
          if (
            !location.physicalLocation?.artifactLocation?.uriBaseId ||
            !location.physicalLocation?.artifactLocation?.uri ||
            !location.physicalLocation?.region
          )
            return;

          const filePathBase: string = location.physicalLocation.artifactLocation.uriBaseId;
          const filePath: string = path.join(filePathBase, location.physicalLocation.artifactLocation.uri);
          const region: Region = location.physicalLocation.region;

          const hint: ReviewHint = {
            ruleId: result.ruleId!,
            message: result.message.text!,
            region,
          };

          if (!fileMap.has(filePath)) {
            fileMap.set(filePath, [hint]);
          } else {
            fileMap.get(filePath)!.push(hint);
          }
        });
      });
    });

    await Promise.all(
      Array.from(fileMap.entries()).map(async ([filePath, hints]) => {
        const codeSnippet = await fse.readFile(filePath, 'utf-8');
        const codeSnippetLines = codeSnippet.split(/(?<!\\)(?:\r?\n)/);
        const aiResponse: ReviewResponse = await aiProvider.reviewCode(codeSnippet, hints);

        const commitSha = await GitHelper.verifyCommitSha(repoDir, flags.from);

        aiResponse.reviews.forEach((review) => {
          // get indent level of the code snippet
          const indentLevel = codeSnippetLines[review.startLine - 1].search(/\S/);

          // add indent level to each line of the code suggestion
          // eslint-disable-next-line no-param-reassign
          review.codeSuggestion = review.codeSuggestion
            .split(/(?<!\\)(?:\r?\n)/)
            .map((line) => ' '.repeat(indentLevel) + line)
            .join('\n');

          // In response LLM sometimes for some reason escapes new line character and ignores instructions, so we need to unescape it
          // eslint-disable-next-line no-param-reassign
          review.codeSuggestion = review.codeSuggestion.replace(/\\n/g, '\n');

          const codeSuggestionLines = review.codeSuggestion.split(/(?<!\\)(?:\r?\n)/);
          const prependLine = codeSnippetLines[review.startLine - 1];
          const appendLine = codeSnippetLines[review.endLine - 1];

          // Fix the code suggestion based on the code suggestion type
          // Sometimes LLM forgets to include original code snippet in the suggestion
          switch (review.codeSuggestionType?.toUpperCase()) {
            case 'PREPEND':
              if (codeSuggestionLines[codeSuggestionLines.length - 1] !== prependLine) {
                // eslint-disable-next-line no-param-reassign
                review.codeSuggestion = review.codeSuggestion + '\n' + prependLine;
              }
              // eslint-disable-next-line no-param-reassign
              review.endLine = review.startLine;
              break;
            case 'APPEND':
              if (codeSuggestionLines[0] !== appendLine) {
                // eslint-disable-next-line no-param-reassign
                review.codeSuggestion = appendLine + '\n' + review.codeSuggestion;
              }
              // eslint-disable-next-line no-param-reassign
              review.startLine = review.endLine;
              break;
            case 'REMOVE':
              // eslint-disable-next-line no-param-reassign
              review.codeSuggestion = '';
              break;
            default:
              break;
          }

          this.log('-----------------------------------');
          this.log(`File: ${filePath}`);
          this.log(`Lines: ${review.startLine} - ${review.endLine}`);
          this.log(`Comment: ${review.comment}`);
          this.log(`Code Suggestion: ${review.codeSuggestion}`);
          this.log(`Code Suggestion Type: ${review.codeSuggestionType}`);
          this.log('-----------------------------------\n');
          const prCommentRequest: PullRequestComment = {
            prNumber: flags['pull-request-id']!,
            message: review.comment,
            suggestedCodeChange: review.codeSuggestion,
            sourceFile: filePath.replace(diffDir + '/', ''),
            startLine: review.startLine,
            endLine: review.endLine,
            commitId: commitSha,
          };

          // No point of going further if there are no Pull Request information or Git Provider
          if (!flags['pull-request-id'] || !gitProvider) return;

          gitProvider.addPRComment(prCommentRequest).catch((error) => {
            this.log(String(error));
          });
        });
      })
    );

    // Clean up the temporary directory
    await fse.remove(diffDir);
  }
}
