import { SCATProviderType, SFCodeAnalyzer, SCATProvider } from './index.js';

export default class SCATProviderFactory {
  public static getInstance(
    providerType: SCATProviderType,
    scanDirectory: string,
    configFile: string = ''
  ): SCATProvider {
    switch (providerType) {
      case SCATProviderType.SFCodeAnalyzer:
        return new SFCodeAnalyzer(scanDirectory, configFile, 'code-analyzer.sarif');
      default:
        throw new Error('Unsupported SCAT Provider type');
    }
  }
}
