import { type UserBook } from './userBook.js';

export interface UpdateUserBookGenresPathParams {
  readonly userBookId: string;
}

export interface UpdateUserBookGenresRequestBody {
  readonly genreIds: string[];
}

export type UpdateUserBookGenresResponseBody = UserBook;
