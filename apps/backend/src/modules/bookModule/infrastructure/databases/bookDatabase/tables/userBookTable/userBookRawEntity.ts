import { type ReadingStatus } from '@common/contracts';

export interface UserBookRawEntity {
  readonly id: string;
  readonly imageUrl?: string | undefined | null;
  readonly status: ReadingStatus;
  readonly isFavorite: boolean;
  readonly bookId: string;
  readonly bookshelfId: string;
  readonly createdAt: Date;
}
