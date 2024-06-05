import { type UserBook, type UserBookState } from '../../entities/userBook/userBook.js';

export interface SaveUserBookPayload {
  readonly userBook: UserBook | UserBookState;
}

export interface SaveUserBooksPayload {
  readonly userBooks: UserBook[];
}

export interface FindUserBookPayload {
  readonly id?: string;
  readonly bookshelfId?: string;
  readonly bookId?: string;
  readonly title?: string;
  readonly authorIds?: string[];
}

export interface FindUserBooksPayload {
  readonly ids?: string[];
  readonly bookshelfId?: string | undefined;
  readonly collectionId?: string | undefined;
  readonly isbn?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindUserBooksByUserPayload {
  readonly bookIdentifier?: {
    readonly id: string;
    readonly isbn?: string | undefined;
  };
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteUserBooksPayload {
  readonly ids: string[];
}

export interface UserBookRepository {
  saveUserBook(payload: SaveUserBookPayload): Promise<UserBook>;
  saveUserBooks(payload: SaveUserBooksPayload): Promise<void>;
  findUserBook(payload: FindUserBookPayload): Promise<UserBook | null>;
  findUserBooks(payload: FindUserBooksPayload): Promise<UserBook[]>;
  findUserBooksByUser(payload: FindUserBooksByUserPayload): Promise<UserBook[]>;
  countUserBooks(payload: FindUserBooksPayload): Promise<number>;
  deleteUserBooks(payload: DeleteUserBooksPayload): Promise<void>;
}
