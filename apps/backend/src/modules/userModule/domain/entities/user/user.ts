export interface UserDraft {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;
  public readonly firstName: string;
  public readonly lastName: string;

  public constructor(draft: UserDraft) {
    const { id, email, password, firstName, lastName } = draft;

    this.id = id;

    this.password = password;

    this.email = email;

    this.firstName = firstName;

    this.lastName = lastName;
  }
}
