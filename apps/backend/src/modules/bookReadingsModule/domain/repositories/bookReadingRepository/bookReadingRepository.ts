import { type BookReading } from '../../entities/bookReading/bookReading.js';
import { type BookReadingDraft } from '../../entities/bookReading/bookReadingDraft/bookReadingDraft.js';

export interface FindByIdPayload {
  id: string;
}

export interface FindByBookIdPayload {
  bookId: string;
}

export interface SavePayload {
  entity: BookReading | BookReadingDraft;
}

export interface DeletePayload {
  entity: BookReading;
}

export interface BookReadingRepository {
  findById(payload: FindByIdPayload): Promise<BookReading | null>;
  findByBookId(payload: FindByBookIdPayload): Promise<BookReading[]>;
  save(payload: SavePayload): Promise<BookReading>;
  delete(payload: DeletePayload): Promise<void>;
}
