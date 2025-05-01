export interface CategoryDraft {
  readonly id: string;
  readonly name: string;
}

export interface CategoryState {
  name: string;
}

export interface SetNamePayload {
  readonly name: string;
}

export class Category {
  private readonly id: string;
  private readonly state: CategoryState;

  public constructor(draft: CategoryDraft) {
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

  public getState(): CategoryState {
    return this.state;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }
}
