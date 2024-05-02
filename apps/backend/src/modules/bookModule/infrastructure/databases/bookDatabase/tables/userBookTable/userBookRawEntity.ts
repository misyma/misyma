import { type ReadingStatus } from '@common/contracts';

export interface UserBookRawEntity {
  readonly id: string;
  readonly imageUrl?: string | undefined | null;
  readonly status: ReadingStatus;
  readonly bookId: string;
  readonly bookshelfId: string;
}
