# sf-ami

[![NPM](https://img.shields.io/npm/v/sf-ami.svg?label=sf-ami)](https://www.npmjs.com/package/sf-ami) [![Downloads/week](https://img.shields.io/npm/dw/sf-ami.svg)](https://npmjs.org/package/sf-ami) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/sf-ami/main/LICENSE.txt)

sf-ami is a suite of tools designed to seamlessly integrate AI into your everyday workflow when working with Salesforce code.

## Install

```bash
sf plugins install sf-ami@latest
```

## Issues

Please report any issues at https://github.com/laserburst/sf-ami/issues

## Contributing

We welcome contributions from the community. If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## Commands

<!-- commands -->

- [`sf ami review diff`](#sf-ami-review-diff)

## `sf ami review diff`

Performs an AI-assisted review of code changes between two commits or branches.

```
USAGE
  $ sf ami review diff -a OpenAI -n <value> -m <value> [--json] [--flags-dir <value>] [-r <value>] [-f <value>] [-t
    <value>] [-p <value>] [-c <value>] [-g GitHub] [-k <value>] [-w <value>] [-e <value>]

FLAGS
  -a, --ai-provider=<option>
      (required) The AI service provider to use.

      Supported values:

      - OpenAI
      <options: OpenAI>

  -c, --config-file=<value>
      Path to the configuration file used by the code analyzer (optional).

  -e, --git-repo=<value>
      Repository name for the Git provider (optional).

  -f, --from=<value>
      [default: HEAD~1] The base commit or branch from which changes are compared (default is "HEAD~1").

  -g, --git-provider=<option>
      The Git hosting service to use for posting comments (optional).

      Supported values:

      - GitHub
      <options: GitHub>

  -k, --git-token=<value>
      Authentication token for the Git provider (optional).

  -m, --ai-model=<value>
      (required) The model to use for generating code review suggestions.

  -n, --ai-token=<value>
      (required) Authentication token for the AI provider.

  -p, --pull-request-id=<value>
      Identifier for the pull request to which review comments should be posted (optional).

  -r, --repo-dir=<value>
      [default: /home/runner/work/sf-ami/sf-ami] Specifies the path to the local Git repository (default is current
      working directory).

  -t, --to=<value>
      [default: HEAD] The target commit or branch to which changes are compared (default is "HEAD").

  -w, --git-owner=<value>
      Repository owner's name for the Git provider (optional).

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Performs an AI-assisted review of code changes between two commits or branches.

  This command automates the process of generating code review comments for diffs in a Git repository by:

  - Creating a temporary directory containing the differences between the specified commits/branches.
  - Running a static code analysis over the diff, which produces SARIF data that includes diagnostic messages and hints
  regarding potential issues in the code.
  - Invoking an AI provider (e.g., OpenAI) to generate review comments and code suggestions based on the collected hints
  and the actual code snippet.
  - Optionally, posting the AI-generated review comments as pull request comments on supported Git hosting providers
  (such as GitHub or BitBucket) when pull request information and credentials are provided.

EXAMPLES
  $ sf ami review diff --repo-dir ./ --ai-provider=OpenAI --ai-model=gpt-4o-mini --ai-token=$OPENAI_TOKEN --git-provider=GitHub --git-token=$GITHUB_TOKEN--git-owner=nazim-aliyev --git-repo=review-sample --pull-request-id=2 --from=HEAD --to=main
```

<!-- commandsstop -->
