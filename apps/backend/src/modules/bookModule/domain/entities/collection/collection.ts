export interface CollectionDraft {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly createdAt: Date;
}

export interface CollectionState {
  name: string;
  readonly userId: string;
  readonly createdAt: Date;
}

export interface SetNamePayload {
  readonly name: string;
}

export class Collection {
  private readonly id: string;
  private readonly state: CollectionState;

  public constructor(draft: CollectionDraft) {
    const { id, name, userId, createdAt } = draft;

    this.id = id;

    this.state = {
      name,
      userId,
      createdAt,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.state.userId;
  }

  public getName(): string {
    return this.state.name;
  }

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }

  public getState(): CollectionState {
    return this.state;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }
}
