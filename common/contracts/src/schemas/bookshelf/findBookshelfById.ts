import { type Bookshelf } from './bookshelf.js';

export interface FindBookshelfByIdParams {
  readonly id: string;
}

export interface FindBookshelfByIdResponseBody extends Bookshelf {}
