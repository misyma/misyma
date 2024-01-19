export interface BookshelfDraftState {
  readonly userId: string;
  readonly name: string;
  readonly addressId?: string | undefined;
}

export class BookshelfDraft {
  private readonly state: BookshelfDraftState;

  public constructor(state: BookshelfDraftState) {
    this.state = state;
  }

  public getUserId(): string {
    return this.state.userId;
  }

  public getName(): string {
    return this.state.name;
  }

  public getAddressId(): string | undefined {
    return this.state.addressId;
  }
}
