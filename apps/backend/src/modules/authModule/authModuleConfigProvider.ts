export interface AuthModuleConfigProvider {
  getJwtSecret(): string;
  getJwtExpiresIn(): number;
}
