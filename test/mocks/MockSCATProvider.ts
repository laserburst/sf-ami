import { Log } from 'sarif';
import { SCATProvider } from '../../src/common/contextProviders/scat/index.js';

export class MockSCATProvider extends SCATProvider {
  private lastRun: Log | null = null;

  public constructor(scanDirectory: string) {
    super(scanDirectory, '', 'mock-sarif.json');
  }

  public override async run(): Promise<Log> {
    this.lastRun = {
      runs: [
        {
          results: [
            {
              ruleId: 'mock-rule',
              message: { text: 'Mock issue found' },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: 'fake-file.ts', uriBaseId: '/tmp' },
                    region: { startLine: 10, endLine: 15 },
                  },
                },
              ],
            },
          ],
        },
      ],
    } as Log;
    return this.lastRun;
  }

  public override async getSarifFile(): Promise<Log> {
    return this.lastRun ?? (await this.run());
  }
}
