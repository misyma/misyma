import { type BookshelfType } from '@common/contracts';

export interface BookshelfDraft {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: BookshelfType;
  readonly createdAt: Date;
  readonly imageUrl?: string | undefined | null;
}

export interface BookshelfState {
  name: string;
  readonly userId: string;
  readonly type: BookshelfType;
  readonly createdAt: Date;
  imageUrl?: string | undefined | null;
}

export interface SetNamePayload {
  readonly name: string;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string | null;
}

export class Bookshelf {
  private readonly id: string;
  private readonly state: BookshelfState;

  public constructor(draft: BookshelfDraft) {
    this.id = draft.id;

    this.state = {
      name: draft.name,
      userId: draft.userId,
      type: draft.type,
      createdAt: draft.createdAt,
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

  public getType(): BookshelfType {
    return this.state.type;
  }

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }

  public getImageUrl(): string | undefined | null {
    return this.state.imageUrl;
  }
}
