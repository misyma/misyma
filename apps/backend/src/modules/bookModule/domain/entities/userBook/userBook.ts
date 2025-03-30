import { type ReadingStatus } from '@common/contracts';

import { type BookDraft } from '../book/book.js';
import { type BookReading } from '../bookReading/bookReading.js';
import { type Collection } from '../collection/collection.js';
import { type Genre } from '../genre/genre.js';

export interface UserBookDraft {
  readonly id: string;
  readonly imageUrl?: string | undefined | null;
  readonly status: ReadingStatus;
  readonly isFavorite: boolean;
  readonly bookshelfId: string;
  readonly createdAt: Date;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  readonly collections?: Collection[] | undefined;
  readonly readings?: BookReading[] | undefined;
  readonly latestRating?: number | undefined;
}

export interface UserBookState {
  imageUrl?: string | undefined | null;
  status: ReadingStatus;
  isFavorite: boolean;
  bookshelfId: string;
  readonly createdAt: Date;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  collections?: Collection[] | undefined;
  readonly readings?: BookReading[] | undefined;
  readonly latestRating?: number | undefined;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string | null;
}

export interface SetStatusPayload {
  readonly status: ReadingStatus;
}

export interface SetIsFavoritePayload {
  readonly isFavorite: boolean;
}

export interface SetBookshelfIdPayload {
  readonly bookshelfId: string;
}

export interface SetGenrePayload {
  readonly genre: Genre;
}

export interface SetCollectionsPayload {
  readonly collections: Collection[];
}

export class UserBook {
  private readonly _id: string;
  private readonly state: UserBookState;

  public constructor(draft: UserBookDraft) {
    const {
      id,
      imageUrl,
      status,
      isFavorite,
      bookshelfId,
      createdAt,
      bookId,
      book,
      readings,
      collections,
      latestRating,
    } = draft;

    this._id = id;

    let state: UserBookState = {
      status,
      isFavorite,
      bookshelfId,
      createdAt,
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

    if (readings !== undefined) {
      state = {
        ...state,
        readings,
      };
    }

    if (collections !== undefined) {
      state = {
        ...state,
        collections,
      };
    }

    if (latestRating !== undefined) {
      state = {
        ...state,
        latestRating,
      };
    }

    this.state = state;
  }

  public getState(): UserBookState {
    return this.state;
  }

  public get id(): string {
    return this._id;
  }

  public set id(_) {
    throw new Error("Cannot change UserBook id!");
  }

  public getBook(): BookDraft | undefined {
    return this.state.book;
  }

  public get imageUrl(): string | undefined | null {
    return this.state.imageUrl;
  }

  public get status(): ReadingStatus {
    return this.state.status;
  }

  public get isFavorite(): boolean {
    return this.state.isFavorite;
  }

  public get bookshelfId(): string {
    return this.state.bookshelfId;
  }

  public get createdAt(): Date {
    return this.state.createdAt;
  }

  public get bookId(): string {
    return this.state.bookId;
  }

  public get collections(): Collection[] | undefined {
    return this.state.collections ?  [...this.state.collections] : undefined;
  }

  public get readings(): BookReading[] | undefined {
    return this.state.readings ? [...this.state.readings] : undefined;
  }

  public get latestReading(): number | undefined {
    return this.state.latestRating;
  }

  public set imageUrl(payload: SetImageUrlPayload) {
    const { imageUrl } = payload;

    this.state.imageUrl = imageUrl;
  }

  public set status(payload: SetStatusPayload) {
    const { status } = payload;

    this.state.status = status;
  }

  public set isFavorite(payload: SetIsFavoritePayload) {
    const { isFavorite } = payload;

    this.state.isFavorite = isFavorite;
  }

  public set bookshelfId(payload: SetBookshelfIdPayload) {
    const { bookshelfId } = payload;

    this.state.bookshelfId = bookshelfId;
  }

  public set collections(payload: SetCollectionsPayload) {
    const { collections } = payload;

    this.state.collections = collections;
  }
}
