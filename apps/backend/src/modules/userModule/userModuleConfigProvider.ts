export interface UserModuleConfigProvider {
  getHashSaltRounds(): number;
  getConfirmEmailLink(): string;
  getResetPasswordLink(): string;
}
