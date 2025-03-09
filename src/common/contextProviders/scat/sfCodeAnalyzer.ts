import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { Log } from 'sarif';
import SCATProvider from './scatProvider.js';
export default class SFCodeAnalyzer extends SCATProvider {
  private readonly defaultConfigFileName: string = path.join(
    dirname(fileURLToPath(import.meta.url)),
    'sfCodeAnalyzerDefaultConfig.yml'
  );

  public override async run(): Promise<Log> {
    await execa('sf', [
      'code-analyzer',
      'run',
      '--workspace',
      this.getScanDirectory(),
      '--output-file',
      this.getSarifFileName(),
      '--config-file',
      this.getConfigFile() ? this.getConfigFile() : this.defaultConfigFileName,
    ]);

    return this.getSarifFile();
  }
}
