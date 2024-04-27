import { type BookshelfState, type Bookshelf } from '../../entities/bookshelf/bookshelf.js';

export interface FindBookshelfPayload {
  readonly where:
    | {
        readonly id: string;
      }
    | {
        readonly userId: string;
        readonly name: string;
      };
}

export interface FindBookshelvesPayload {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
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
  countBookshelves(payload: FindBookshelvesPayload): Promise<number>;
  saveBookshelf(payload: SaveBookshelfPayload): Promise<Bookshelf>;
  deleteBookshelf(payload: DeleteBookshelfPayload): Promise<void>;
}
