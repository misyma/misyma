export interface BookshelfDraft {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly addressId?: string | undefined;
  readonly imageUrl?: string | undefined;
}

export interface BookshelfState {
  name: string;
  userId: string;
  addressId?: string | undefined;
  imageUrl?: string | undefined;
}

export interface SetNamePayload {
  readonly name: string;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string;
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
      imageUrl: draft.imageUrl,
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

  public setImageUrl(payload: SetImageUrlPayload): void {
    const { imageUrl } = payload;

    this.state.imageUrl = imageUrl;
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

  public getImageUrl(): string | undefined {
    return this.state.imageUrl;
  }
}
