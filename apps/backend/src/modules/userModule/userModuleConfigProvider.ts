export interface UserModuleConfigProvider {
  getHashSaltRounds(): number;
  getFrontendUrl(): string;
  getAccessTokenExpiresIn(): number;
  getRefreshTokenExpiresIn(): number;
  getEmailVerificationTokenExpiresIn(): number;
  getResetPasswordTokenExpiresIn(): number;
}
