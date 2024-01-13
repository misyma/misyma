export interface UserTokens {
  readonly refreshTokens: string[];
  readonly resetPasswordToken: string | undefined;
  readonly emailVerificationToken: string | undefined;
}
