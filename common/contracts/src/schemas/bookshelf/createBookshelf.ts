import { type Bookshelf } from './bookshelf.js';

export interface CreateBookshelfRequestBody {
  readonly name: string;
  readonly imageUrl?: string;
}

export interface CreateBookshelfResponseBody extends Bookshelf {}
