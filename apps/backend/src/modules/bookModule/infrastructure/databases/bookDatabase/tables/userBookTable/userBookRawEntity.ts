import { type BookStatus } from '@common/contracts';

export interface UserBookRawEntity {
  readonly id: string;
  readonly imageUrl?: string | undefined;
  readonly status: BookStatus;
  readonly bookId: string;
  readonly bookshelfId: string;
}
