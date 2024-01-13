export interface UserTokens {
  readonly refreshTokens: string[];
  readonly resetPasswordToken?: string;
  readonly emailVerificationToken?: string;
}
