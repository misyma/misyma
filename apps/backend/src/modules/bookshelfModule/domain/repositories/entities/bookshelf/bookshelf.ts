export interface BookshelfState {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly addressId?: string | undefined;
}

export class Bookshelf {
  private readonly state: BookshelfState;

  public constructor(state: BookshelfState) {
    this.state = state;
  }

  public getState(): BookshelfState {
    return { ...this.state };
  }

  public getId(): string {
    return this.state.id;
  }

  public getName(): string {
    return this.state.name;
  }

  public getUserId(): string {
    return this.state.userId;
  }

  public getAddressId(): string | undefined {
    return this.state.addressId;
  }
}
