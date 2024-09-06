export interface AuthorDraft {
  readonly id: string;
  readonly name: string;
  readonly isApproved: boolean;
  readonly createdAt: Date;
}

export interface AuthorState {
  name: string;
  isApproved: boolean;
  readonly createdAt: Date;
}

export interface SetNamePayload {
  readonly name: string;
}

export interface SetApprovedPayload {
  readonly isApproved: boolean;
}

export class Author {
  private readonly id: string;
  private readonly state: AuthorState;

  public constructor(draft: AuthorDraft) {
    const { id, name, isApproved, createdAt } = draft;

    this.id = id;

    this.state = {
      name,
      isApproved,
      createdAt,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getState(): AuthorState {
    return this.state;
  }

  public getName(): string {
    return this.state.name;
  }

  public getIsApproved(): boolean {
    return this.state.isApproved;
  }

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }

  public setIsApproved(payload: SetApprovedPayload): void {
    const { isApproved } = payload;

    this.state.isApproved = isApproved;
  }
}
