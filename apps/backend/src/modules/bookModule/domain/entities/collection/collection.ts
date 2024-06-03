export interface CollectionDraft {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
}

export interface CollectionState {
  name: string;
  readonly userId: string;
}

export interface SetNamePayload {
  readonly name: string;
}

export class Collection {
  private readonly id: string;
  private readonly state: CollectionState;

  public constructor(draft: CollectionDraft) {
    const { id, name, userId } = draft;

    this.id = id;

    this.state = {
      name,
      userId,
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

  public getState(): CollectionState {
    return this.state;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }
}
