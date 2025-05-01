import { type Language, type ReadingStatus } from '@common/contracts';

import { type UserBook, type UserBookState } from '../../entities/userBook/userBook.js';

export interface SaveUserBookPayload {
  readonly userBook: UserBook | UserBookState;
}

export interface SaveUserBooksPayload {
  readonly userBooks: UserBook[];
}

export interface FindUserBookOwnerPayload {
  readonly id: string;
}

export interface FindUserBookOwnerResult {
  readonly userId: string | undefined;
}

export interface FindUserBookPayload {
  readonly id?: string;
  readonly bookshelfId?: string;
  readonly bookId?: string;
  readonly title?: string;
  readonly authorIds?: string[];
}

export interface FindUserBooksPayload {
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly authorId?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly userId?: string | undefined;
  readonly bookId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly status?: ReadingStatus | undefined;
  readonly isFavorite?: boolean | undefined;
  readonly language?: Language | undefined;
  readonly releaseYearAfter?: number | undefined;
  readonly releaseYearBefore?: number | undefined;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: 'releaseYear' | 'createdAt' | 'rating' | 'readingDate' | undefined;
  readonly sortOrder?: 'asc' | 'desc' | undefined;
  readonly isRated?: boolean | undefined;
}

export interface CountUserBooksPayload {
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly authorId?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly userId?: string | undefined;
  readonly bookId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly title?: string | undefined;
  readonly status?: ReadingStatus | undefined;
  readonly isFavorite?: boolean | undefined;
  readonly language?: Language | undefined;
  readonly releaseYearAfter?: number | undefined;
  readonly releaseYearBefore?: number | undefined;
  readonly isRated?: boolean | undefined;
}

export interface DeleteUserBooksPayload {
  readonly ids: string[];
}

export interface UserBookRepository {
  saveUserBook(payload: SaveUserBookPayload): Promise<UserBook>;
  saveUserBooks(payload: SaveUserBooksPayload): Promise<void>;
  findUserBook(payload: FindUserBookPayload): Promise<UserBook | null>;
  findUserBooks(payload: FindUserBooksPayload): Promise<UserBook[]>;
  findUserBookOwner(payload: FindUserBookOwnerPayload): Promise<FindUserBookOwnerResult>;
  countUserBooks(payload: CountUserBooksPayload): Promise<number>;
  deleteUserBooks(payload: DeleteUserBooksPayload): Promise<void>;
}
