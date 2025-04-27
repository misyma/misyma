import { type Language, type BookFormat } from '@common/contracts';

export interface BookRawEntity {
  readonly id: string;
  readonly genreId: string;
  readonly title: string;
  readonly isbn?: string | undefined | null;
  readonly publisher?: string | undefined | null;
  readonly releaseYear: number;
  readonly language: Language;
  readonly translator?: string | undefined | null;
  readonly format?: BookFormat | undefined | null;
  readonly pages?: number | undefined | null;
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined | null;
  readonly createdAt: Date;
}
