export interface AuthorDraft {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
}

export class Author {
  private readonly id: string;
  private readonly firstName: string;
  private readonly lastName: string;

  public constructor(draft: AuthorDraft) {
    const { id, firstName, lastName } = draft;

    this.id = id;

    this.firstName = firstName;

    this.lastName = lastName;
  }

  public getId(): string {
    return this.id;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }
}
