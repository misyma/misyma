import { type ReadingStatus } from '@common/contracts';

export interface UserBookRawEntity {
  readonly id: string;
  readonly image_url?: string | undefined | null;
  readonly status: ReadingStatus;
  readonly is_favorite: boolean;
  readonly book_id: string;
  readonly bookshelf_id: string;
  readonly created_at: Date;
}
