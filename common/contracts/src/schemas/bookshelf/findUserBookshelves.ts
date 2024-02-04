import { type Bookshelf } from './bookshelf.js';

export interface FindBookshelvesByUserIdParams {
  readonly userId: string;
}

export interface FindBookshelvesByUserIdResponseBody {
  readonly bookshelves: Bookshelf[];
}
