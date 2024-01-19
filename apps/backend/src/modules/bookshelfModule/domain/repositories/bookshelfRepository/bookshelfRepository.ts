import { type Bookshelf } from '../../entities/bookshelf/bookshelf.js';
import { type BookshelfDraft } from '../../entities/bookshelf/bookshelfDraft/bookshelfDraft.js';

export interface FindByIdPayload {
  id: string;
}

export interface FindByUserIdPayload {
  userId: string;
}

export interface SavePayload {
  entity: Bookshelf | BookshelfDraft;
}

export interface DeletePayload {
  entity: Bookshelf;
}

export interface BookshelfRepository {
  findById(payload: FindByIdPayload): Promise<Bookshelf | null>;
  findByUserId(payload: FindByUserIdPayload): Promise<Bookshelf[]>;
  save(payload: SavePayload): Promise<Bookshelf>;
  delete(payload: DeletePayload): Promise<void>;
}
