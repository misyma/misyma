import { type UserBookExpandField } from '@common/contracts';

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
  readonly bookId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly userId?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: 'asc' | 'desc' | undefined;
  readonly expandFields: UserBookExpandField[];
}

export interface CountUserBooksPayload {
  readonly bookId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly userId?: string | undefined;
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
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
