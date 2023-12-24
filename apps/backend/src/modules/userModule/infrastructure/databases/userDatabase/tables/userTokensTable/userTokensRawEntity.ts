export interface UserTokensRawEntity {
  readonly id: string;
  readonly userId: string;
  readonly refreshToken: string;
  readonly resetPasswordToken?: string;
  readonly emailVerificationToken?: string;
}
