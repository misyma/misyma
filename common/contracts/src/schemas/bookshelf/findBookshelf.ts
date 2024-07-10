import { type Bookshelf } from './bookshelf.js';

export interface FindBookshelfParams {
  readonly bookshelfId: string;
}

export interface FindBookshelfResponseBody extends Bookshelf {}
