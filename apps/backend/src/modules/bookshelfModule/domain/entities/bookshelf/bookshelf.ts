export interface BookshelfDraft {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly addressId?: string | undefined;
}

export interface BookshelfState {
  name: string;
  userId: string;
  addressId?: string | undefined;
}

export interface SetNamePayload {
  readonly name: string;
}

export interface SetAddressIdPayload {
  readonly addressId: string | undefined;
}

export class Bookshelf {
  private readonly id: string;
  private readonly state: BookshelfState;

  public constructor(draft: BookshelfDraft) {
    this.id = draft.id;

    this.state = {
      name: draft.name,
      userId: draft.userId,
      addressId: draft.addressId,
    };
  }

  public getState(): BookshelfState {
    return this.state;
  }

  public setName(payload: SetNamePayload): void {
    const { name } = payload;

    this.state.name = name;
  }

  public setAddressId(payload: SetAddressIdPayload): void {
    const { addressId } = payload;

    this.state.addressId = addressId;
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

  public getAddressId(): string | undefined {
    return this.state.addressId;
  }
}
