# summary

Performs an AI-assisted review of code changes between two commits or branches.

# description

This command automates the process of generating code review comments for diffs in a Git repository by:

- Creating a temporary directory containing the differences between the specified commits/branches.
- Running a static code analysis over the diff, which produces SARIF data that includes diagnostic messages and hints regarding potential issues in the code.
- Invoking an AI provider (e.g., OpenAI) to generate review comments and code suggestions based on the collected hints and the actual code snippet.
- Optionally, posting the AI-generated review comments as pull request comments on supported Git hosting providers (such as GitHub or BitBucket) when pull request information and credentials are provided.

# examples

- sf ami review diff --repo-dir ./ --ai-provider=OpenAI --ai-model=gpt-4o-mini --ai-token=$OPENAI_TOKEN --git-provider=GitHub --git-token=$GITHUB_TOKEN--git-owner=nazim-aliyev --git-repo=review-sample --pull-request-id=2 --from=HEAD --to=main

# flags.repo-dir.summary

Specifies the path to the local Git repository (default is current working directory).

# flags.from.summary

The base commit or branch from which changes are compared (default is "HEAD~1").

# flags.to.summary

The target commit or branch to which changes are compared (default is "HEAD").

# flags.pull-request-id.summary

Identifier for the pull request to which review comments should be posted (optional).

# flags.config-file.summary

Path to the configuration file used by the code analyzer (optional).

# flags.ai-provider.summary

The AI service provider to use.

Supported values:

- OpenAI

# flags.ai-token.summary

Authentication token for the AI provider.

# flags.ai-model.summary

The model to use for generating code review suggestions.

# flags.git-provider.summary

The Git hosting service to use for posting comments (optional).

Supported values:

- GitHub

# flags.git-token.summary

Authentication token for the Git provider (optional).

# flags.git-owner.summary

Repository owner's name for the Git provider (optional).

# flags.git-repo.summary

Repository name for the Git provider (optional).
