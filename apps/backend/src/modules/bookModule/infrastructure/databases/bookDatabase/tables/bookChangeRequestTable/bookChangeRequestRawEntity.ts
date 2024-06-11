import { type Language, type BookFormat } from '@common/contracts';

export interface BookRawEntity {
  readonly id: string;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly bookId: string;
  readonly userId: string;
}
