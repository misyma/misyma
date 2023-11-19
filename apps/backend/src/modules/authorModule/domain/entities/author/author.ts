export interface AuthorDraft {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
}

export class Author {
  public readonly id: string;
  public readonly firstName: string;
  public readonly lastName: string;

  public constructor(draft: AuthorDraft) {
    const { id, firstName, lastName } = draft;

    this.id = id;

    this.firstName = firstName;

    this.lastName = lastName;
  }
}
