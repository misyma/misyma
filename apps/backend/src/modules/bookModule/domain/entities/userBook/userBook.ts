import { type ReadingStatus } from '@common/contracts';

import { type BookDraft } from '../book/book.js';
import { type Genre } from '../genre/genre.js';

export interface UserBookDraft {
  readonly id: string;
  readonly imageUrl?: string | undefined | null;
  readonly status: ReadingStatus;
  readonly bookshelfId: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  readonly genres: Genre[];
}

export interface UserBookState {
  imageUrl?: string | undefined | null;
  status: ReadingStatus;
  bookshelfId: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  genres: Genre[];
}

export interface SetImageUrlPayload {
  readonly imageUrl: string | null;
}

export interface SetStatusPayload {
  readonly status: ReadingStatus;
}

export interface SetBookshelfIdPayload {
  readonly bookshelfId: string;
}

export interface SetGenresPayload {
  readonly genres: Genre[];
}

export class UserBook {
  private readonly id: string;
  private readonly state: UserBookState;

  public constructor(draft: UserBookDraft) {
    const { id, imageUrl, status, bookshelfId, bookId, book, genres } = draft;

    this.id = id;

    let state: UserBookState = {
      status,
      bookshelfId,
      bookId,
      genres,
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

  public getImageUrl(): string | undefined | null {
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

  public getGenres(): Genre[] {
    return this.state.genres;
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

  public setGenres(payload: SetGenresPayload): void {
    const { genres } = payload;

    this.state.genres = genres;
  }
}
