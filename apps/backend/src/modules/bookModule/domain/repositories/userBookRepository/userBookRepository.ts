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
}

export interface DeleteUserBookPayload {
  readonly id: string;
}

export interface UserBookRepository {
  saveUserBook(input: SaveUserBookPayload): Promise<UserBook>;
  findUserBook(input: FindUserBookPayload): Promise<UserBook | null>;
  findUserBooks(input: FindUserBooksPayload): Promise<UserBook[]>;
  deleteUserBook(input: DeleteUserBookPayload): Promise<void>;
}
