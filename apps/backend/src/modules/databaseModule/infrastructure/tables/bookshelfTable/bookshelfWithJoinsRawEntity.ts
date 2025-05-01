import { type BookshelfType } from '@common/contracts';

export interface BookshelfWithJoinsRawEntity {
  readonly id: string;
  readonly name: string;
  readonly user_id: string;
  readonly type: BookshelfType;
  readonly created_at: Date;
  readonly image_url?: string | undefined | null;
  readonly book_count: string;
}
