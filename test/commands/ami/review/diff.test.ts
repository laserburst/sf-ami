import { expect } from 'chai';
import Sinon from 'sinon';
import fse from 'fs-extra';

import AmiReviewDiff from '../../../../src/commands/ami/review/diff.js';
import { GitHelper, GitProviderFactory } from '../../../../src/common/gitProvider/index.js';
import { SCATProviderFactory } from '../../../../src/common/contextProviders/scat/index.js';
import { AIProviderFactory } from '../../../../src/common/aiProvider/index.js';
import { MockGitProvider, MockAiProvider, MockSCATProvider } from '../../../mocks/index.js';

describe('ami review diff', () => {
  let gitHelperCreateDirectoryWithDiffStub: Sinon.SinonStub;
  let gitHelperverifyCommitShaStub: Sinon.SinonStub;
  let scatProviderStub: Sinon.SinonStub;
  let aiProviderStub: Sinon.SinonStub;
  let gitProviderStub: Sinon.SinonStub;
  let readFileStub: Sinon.SinonStub;

  beforeEach(() => {
    gitHelperCreateDirectoryWithDiffStub = Sinon.stub(GitHelper, 'createDirectoryWithDiff').resolves('/fake-repo-dir');

    gitHelperverifyCommitShaStub = Sinon.stub(GitHelper, 'verifyCommitSha').resolves('fake-commit-id');

    aiProviderStub = Sinon.stub(AIProviderFactory, 'getInstance').callsFake(() => new MockAiProvider());

    gitProviderStub = Sinon.stub(GitProviderFactory, 'getInstance').callsFake(() => new MockGitProvider());

    scatProviderStub = Sinon.stub(SCATProviderFactory, 'getInstance').callsFake(
      () => new MockSCATProvider('/fake/scan/dir')
    );

    readFileStub = Sinon.stub(fse, 'readFile')
      .withArgs(Sinon.match((filePath: string) => filePath.includes('fake-file.ts')))
      .resolves('const x = 10;');
  });

  afterEach(() => {
    Sinon.restore();
  });

  it('should execute run and process findings', async () => {
    const addCommentStub = Sinon.stub(MockGitProvider.prototype, 'addPRComment').resolves();

    await AmiReviewDiff.run([
      '--ai-provider',
      'OpenAI',
      '--ai-token',
      'fake-ai-token',
      '--ai-model',
      'gpt-4',
      '--git-provider',
      'GitHub',
      '--git-token',
      'fake-git-token',
      '--git-owner',
      'fake-owner',
      '--git-repo',
      'fake-repo',
      '--pull-request-id',
      'fake-pr-id',
    ]);

    expect(aiProviderStub.called).to.be.true;
    expect(gitProviderStub.called).to.be.true;
    expect(gitHelperCreateDirectoryWithDiffStub.calledOnce).to.be.true;
    expect(scatProviderStub.calledOnce).to.be.true;
    expect(readFileStub.called).to.be.true;
    expect(gitHelperverifyCommitShaStub.called).to.be.true;
    expect(addCommentStub.called).to.be.true;
  });

  it('should not post a message when PR id is not provided', async () => {
    const addCommentStub = Sinon.stub(MockGitProvider.prototype, 'addPRComment').resolves();

    await AmiReviewDiff.run([
      '--ai-provider',
      'OpenAI',
      '--ai-token',
      'fake-ai-token',
      '--ai-model',
      'gpt-4',
      '--git-provider',
      'GitHub',
      '--git-token',
      'fake-git-token',
      '--git-owner',
      'fake-owner',
      '--git-repo',
      'fake-repo',
    ]);

    expect(aiProviderStub.called).to.be.true;
    expect(gitProviderStub.called).to.be.true;
    expect(gitHelperCreateDirectoryWithDiffStub.calledOnce).to.be.true;
    expect(scatProviderStub.calledOnce).to.be.true;
    expect(readFileStub.called).to.be.true;
    expect(gitHelperverifyCommitShaStub.called).to.be.true;
    expect(addCommentStub.called).to.be.false;
  });

  it('should not instantiate gitProvider if flags were not provided', async () => {
    await AmiReviewDiff.run(['--ai-provider', 'OpenAI', '--ai-token', 'fake-ai-token', '--ai-model', 'gpt-4']);

    expect(aiProviderStub.called).to.be.true;
    expect(gitProviderStub.called).to.be.false;
    expect(gitHelperCreateDirectoryWithDiffStub.calledOnce).to.be.true;
    expect(scatProviderStub.calledOnce).to.be.true;
    expect(readFileStub.called).to.be.true;
    expect(gitHelperverifyCommitShaStub.called).to.be.true;
  });
});
