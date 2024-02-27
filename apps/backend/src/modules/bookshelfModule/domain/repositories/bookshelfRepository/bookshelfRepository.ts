import { type BookshelfState, type Bookshelf } from '../../entities/bookshelf/bookshelf.js';

export interface FindBookshelfPayload {
  readonly id?: string;
  readonly userId?: string;
}

export interface FindBookshelvesPayload {
  readonly userId: string;
}

export interface SaveBookshelfPayload {
  readonly bookshelf: Bookshelf | BookshelfState;
}

export interface DeleteBookshelfPayload {
  readonly id: string;
}

export interface BookshelfRepository {
  findBookshelf(payload: FindBookshelfPayload): Promise<Bookshelf | null>;
  findBookshelves(payload: FindBookshelvesPayload): Promise<Bookshelf[]>;
  saveBookshelf(payload: SaveBookshelfPayload): Promise<Bookshelf>;
  deleteBookshelf(payload: DeleteBookshelfPayload): Promise<void>;
}
