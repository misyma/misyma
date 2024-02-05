import { type Bookshelf } from './bookshelf.js';

export interface CreateBookshelfBody {
  readonly name: string;
  readonly addressId?: string;
}

export interface CreateBookshelfResponseBody {
  readonly bookshelf: Bookshelf;
}
