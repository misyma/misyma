import { type Language, type BookFormat } from '@common/contracts';

export interface BookChangeRequestWithJoinsRawEntity {
  readonly id: string;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly authorIds?: string | undefined;
  readonly bookId: string;
  readonly userEmail: string;
  readonly createdAt: Date;
  readonly bookTitle: string;
  readonly changedFields: string;
}
