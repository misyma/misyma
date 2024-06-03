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
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  readonly genres: Genre[];
  readonly collections: Collection[];
  readonly readings: BookReading[];
}

export interface UserBookState {
  imageUrl?: string | undefined | null;
  status: ReadingStatus;
  isFavorite: boolean;
  bookshelfId: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  genres: Genre[];
  collections: Collection[];
  readonly readings: BookReading[];
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

export interface SetGenresPayload {
  readonly genres: Genre[];
}

export interface SetCollectionsPayload {
  readonly collections: Collection[];
}

export class UserBook {
  private readonly id: string;
  private readonly state: UserBookState;

  public constructor(draft: UserBookDraft) {
    const { id, imageUrl, status, isFavorite, bookshelfId, bookId, book, genres, readings, collections } = draft;

    this.id = id;

    let state: UserBookState = {
      status,
      isFavorite,
      bookshelfId,
      bookId,
      genres,
      readings,
      collections,
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

  public getIsFavorite(): boolean {
    return this.state.isFavorite;
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

  public getCollections(): Collection[] {
    return this.state.collections;
  }

  public getReadings(): BookReading[] {
    return this.state.readings;
  }

  public setImageUrl(payload: SetImageUrlPayload): void {
    const { imageUrl } = payload;

    this.state.imageUrl = imageUrl;
  }

  public setStatus(payload: SetStatusPayload): void {
    const { status } = payload;

    this.state.status = status;
  }

  public setIsFavorite(payload: SetIsFavoritePayload): void {
    const { isFavorite } = payload;

    this.state.isFavorite = isFavorite;
  }

  public setBookshelfId(payload: SetBookshelfIdPayload): void {
    const { bookshelfId } = payload;

    this.state.bookshelfId = bookshelfId;
  }

  public setGenres(payload: SetGenresPayload): void {
    const { genres } = payload;

    this.state.genres = genres;
  }

  public setCollections(payload: SetCollectionsPayload): void {
    const { collections } = payload;

    this.state.collections = collections;
  }
}
