import { type Bookshelf } from './bookshelf.js';

export interface FindBookshelfByIdParams {
  readonly bookshelfId: string;
}

export interface FindBookshelfByIdResponseBody extends Bookshelf {}
