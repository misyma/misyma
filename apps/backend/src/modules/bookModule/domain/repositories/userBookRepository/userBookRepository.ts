import { type UserBook, type UserBookState } from '../../entities/userBook/userBook.js';

export interface SaveUserBookPayload {
  readonly userBook: UserBook | UserBookState;
}

export interface FindUserBookPayload {
  readonly id?: string;
  readonly bookshelfId?: string;
  readonly title?: string;
  readonly authorIds?: string[];
}

export interface FindUserBooksPayload {
  readonly ids: string[];
  readonly bookshelfId?: string | undefined;
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteUserBookPayload {
  readonly id: string;
}

export interface UserBookRepository {
  saveUserBook(payload: SaveUserBookPayload): Promise<UserBook>;
  findUserBook(payload: FindUserBookPayload): Promise<UserBook | null>;
  findUserBooks(payload: FindUserBooksPayload): Promise<UserBook[]>;
  countUserBooks(payload: FindUserBooksPayload): Promise<number>;
  deleteUserBook(inpayloadppayloadut: DeleteUserBookPayload): Promise<void>;
}
