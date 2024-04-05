export interface BookshelfDraft {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly address?: string | undefined;
  readonly imageUrl?: string | undefined;
}

export interface BookshelfState {
  name: string;
  userId: string;
  address?: string | undefined;
  imageUrl?: string | undefined;
}

export interface SetNamePayload {
  readonly name: string;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string;
}

export interface SetAddressPayload {
  readonly address: string | undefined;
}

export class Bookshelf {
  private readonly id: string;
  private readonly state: BookshelfState;

  public constructor(draft: BookshelfDraft) {
    this.id = draft.id;

    this.state = {
      name: draft.name,
      userId: draft.userId,
      address: draft.address,
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

  public setAddress(payload: SetAddressPayload): void {
    const { address } = payload;

    this.state.address = address;
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

  public getAddress(): string | undefined {
    return this.state.address;
  }

  public getImageUrl(): string | undefined {
    return this.state.imageUrl;
  }
}
