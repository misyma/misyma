export interface UserTokensDraft {
  readonly id: string;
  readonly userId: string;
  readonly refreshToken: string;
  readonly resetPasswordToken?: string;
  readonly emailVerificationToken?: string;
}

export class UserTokens {
  private readonly id: string;
  private readonly userId: string;
  private readonly refreshToken: string;
  private readonly resetPasswordToken?: string;
  private readonly emailVerificationToken?: string;

  public constructor(draft: UserTokensDraft) {
    const { id, userId, refreshToken, resetPasswordToken, emailVerificationToken } = draft;

    this.id = id;

    this.userId = userId;

    this.refreshToken = refreshToken;

    if (resetPasswordToken) {
      this.resetPasswordToken = resetPasswordToken;
    }

    if (emailVerificationToken) {
      this.emailVerificationToken = emailVerificationToken;
    }
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getRefreshToken(): string {
    return this.refreshToken;
  }

  public getResetPasswordToken(): string | undefined {
    return this.resetPasswordToken;
  }

  public getEmailVerificationToken(): string | undefined {
    return this.emailVerificationToken;
  }
}
