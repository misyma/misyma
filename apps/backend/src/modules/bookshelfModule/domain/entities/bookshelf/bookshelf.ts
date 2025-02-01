import { type BookshelfType } from '@common/contracts';

export interface BookshelfDraft {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: BookshelfType;
  readonly createdAt: Date;
  readonly imageUrl?: string | undefined | null;
  readonly bookCount?: number | undefined;
}

export interface BookshelfState {
  name: string;
  readonly userId: string;
  readonly type: BookshelfType;
  readonly createdAt: Date;
  imageUrl?: string | undefined | null;
  readonly bookCount?: number | undefined;
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
    const { name, userId, type, createdAt, imageUrl, bookCount } = draft;

    this.id = draft.id;

    let state: BookshelfState = {
      name,
      userId,
      type,
      createdAt,
      imageUrl,
    };

    if (bookCount !== undefined) {
      state = {
        ...state,
        bookCount,
      };
    }

    this.state = state;
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

  public getBookCount(): number | undefined {
    return this.state.bookCount;
  }
}
