import { type ReadingStatus } from '@common/contracts';

import { type BookDraft } from '../book/book.js';

export interface UserBookDraft {
  readonly id: string;
  readonly imageUrl?: string | undefined;
  readonly status: ReadingStatus;
  readonly bookshelfId: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
}

export interface UserBookState {
  imageUrl?: string | undefined;
  status: ReadingStatus;
  bookshelfId: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string;
}

export interface SetStatusPayload {
  readonly status: ReadingStatus;
}

export interface SetBookshelfIdPayload {
  readonly bookshelfId: string;
}

export class UserBook {
  private readonly id: string;
  private readonly state: UserBookState;

  public constructor(draft: UserBookDraft) {
    const { id, imageUrl, status, bookshelfId, bookId, book } = draft;

    this.id = id;

    let state: UserBookState = {
      status,
      bookshelfId,
      bookId,
    };

    if (imageUrl) {
      state.imageUrl = imageUrl;
    }

    if (book) {
      state = {
        ...state,
        book,
      };
    }

    this.state = state;
  }

  public getState(): UserBookState {
    return this.state;
  }

  public getId(): string {
    return this.id;
  }

  public getBook(): BookDraft | undefined {
    return this.state.book;
  }

  public getImageUrl(): string | undefined {
    return this.state.imageUrl;
  }

  public getStatus(): ReadingStatus {
    return this.state.status;
  }

  public getBookshelfId(): string {
    return this.state.bookshelfId;
  }

  public getBookId(): string {
    return this.state.bookId;
  }

  public setImageUrl(payload: SetImageUrlPayload): void {
    const { imageUrl } = payload;

    this.state.imageUrl = imageUrl;
  }

  public setStatus(payload: SetStatusPayload): void {
    const { status } = payload;

    this.state.status = status;
  }

  public setBookshelfId(payload: SetBookshelfIdPayload): void {
    const { bookshelfId } = payload;

    this.state.bookshelfId = bookshelfId;
  }
}
