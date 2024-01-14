export interface ResetPasswordTokenDraft {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
}

export class ResetPasswordToken {
  private readonly id: string;
  private readonly userId: string;
  private readonly token: string;
  private readonly expiresAt: Date;

  public constructor(draft: ResetPasswordTokenDraft) {
    const { id, userId, token, expiresAt } = draft;

    this.id = id;

    this.userId = userId;

    this.token = token;

    this.expiresAt = expiresAt;
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getToken(): string {
    return this.token;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }
}
