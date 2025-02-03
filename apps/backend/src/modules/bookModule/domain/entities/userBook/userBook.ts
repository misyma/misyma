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
  readonly genreId: string;
  readonly genre?: Genre;
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
  genreId: string;
  genre?: Genre;
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
  private readonly id: string;
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
      genreId,
      genre,
      readings,
      collections,
      latestRating,
    } = draft;

    this.id = id;

    let state: UserBookState = {
      status,
      isFavorite,
      bookshelfId,
      createdAt,
      bookId,
      genreId,
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

    if (genre) {
      state = {
        ...state,
        genre,
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

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }

  public getBookId(): string {
    return this.state.bookId;
  }

  public getGenreId(): string {
    return this.state.genreId;
  }

  public getGenre(): Genre | undefined {
    return this.state.genre;
  }

  public getCollections(): Collection[] | undefined {
    return this.state.collections;
  }

  public getReadings(): BookReading[] | undefined {
    return this.state.readings;
  }

  public getLatestRating(): number | undefined {
    return this.state.latestRating;
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

  public setGenre(payload: SetGenrePayload): void {
    const { genre } = payload;

    this.state.genre = genre;

    this.state.genreId = genre.getId();
  }

  public setCollections(payload: SetCollectionsPayload): void {
    const { collections } = payload;

    this.state.collections = collections;
  }
}
