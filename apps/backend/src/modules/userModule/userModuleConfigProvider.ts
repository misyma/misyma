export interface UserModuleConfigProvider {
  getHashSaltRounds(): number;
  getFrontendUrl(): string;
}
