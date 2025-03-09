import path from 'node:path';
import { Log } from 'sarif';
import fse from 'fs-extra';

export default abstract class SCATProvider {
  private readonly scanDirectory: string;
  private readonly configFile: string;
  private readonly sarifFileName: string;

  public constructor(scanDirectory: string, configFile: string, sarifFileName: string) {
    this.sarifFileName = path.join(scanDirectory, sarifFileName);
    this.configFile = configFile;
    if (this.configFile && !fse.existsSync(configFile)) {
      throw new Error(`Config file ${configFile} does not exist`);
    }
    this.scanDirectory = scanDirectory;
  }

  protected async getSarifFile(): Promise<Log> {
    return (await fse.readJson(this.sarifFileName, 'utf-8')) as Log;
  }

  protected getSarifFileName(): string {
    return this.sarifFileName;
  }

  protected getConfigFile(): string {
    return this.configFile;
  }

  protected getScanDirectory(): string {
    return this.scanDirectory;
  }

  public abstract run(scanDirectory: string): Promise<Log>;
}
