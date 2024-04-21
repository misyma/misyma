export interface BookshelfDraft {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
}

export interface BookshelfState {
  name: string;
  userId: string;
}

export interface SetNamePayload {
  readonly name: string;
}

export class Bookshelf {
  private readonly id: string;
  private readonly state: BookshelfState;

  public constructor(draft: BookshelfDraft) {
    this.id = draft.id;

    this.state = {
      name: draft.name,
      userId: draft.userId,
    };
  }

  public getState(): BookshelfState {
    return this.state;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.state.name;
  }

  public getUserId(): string {
    return this.state.userId;
  }
}
