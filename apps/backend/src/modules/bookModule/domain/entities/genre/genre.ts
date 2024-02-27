export interface GenreDraft {
  readonly id: string;
  readonly name: string;
}

export interface GenreState {
  name: string;
}

export interface SetNamePayload {
  readonly name: string;
}

export class Genre {
  private readonly id: string;
  private readonly state: GenreState;

  public constructor(draft: GenreDraft) {
    const { id, name } = draft;

    this.id = id;

    this.state = {
      name,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.state.name;
  }

  public getState(): GenreState {
    return this.state;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }
}
