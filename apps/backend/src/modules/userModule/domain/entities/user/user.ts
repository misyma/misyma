export interface UserDraft {
  readonly id: string;
  readonly email: string;
  readonly password: string;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;

  public constructor(draft: UserDraft) {
    const { id, email, password } = draft;

    this.id = id;

    this.password = password;

    this.email = email;
  }
}
