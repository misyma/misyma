export interface AuthModuleConfigProvider {
  getJwtSecret(): string;
  getJwtExpiresIn(): string;
}
