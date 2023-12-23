export interface UserTokensDraft {
  readonly id: string;
  readonly userId: string;
  readonly refreshToken: string;
  readonly resetPasswordToken: string;
}

export class UserTokens {
  private readonly id: string;
  private readonly userId: string;
  private readonly refreshToken: string;
  private readonly resetPasswordToken: string | null;

  public constructor(draft: UserTokensDraft) {
    const { id, refreshToken, resetPasswordToken, userId } = draft;

    this.id = id;

    this.userId = userId;

    this.refreshToken = refreshToken;

    this.resetPasswordToken = resetPasswordToken;
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

  public getResetPasswordToken(): string | null {
    return this.resetPasswordToken;
  }
}
