import { type Language, type BookFormat } from '@common/contracts';

export interface BookWithJoinsRawEntity {
  readonly id: string;
  readonly title: string;
  readonly genreId: string;
  readonly genreName: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly releaseYear: number;
  readonly language: Language;
  readonly translator: string | null;
  readonly format?: BookFormat | undefined | null;
  readonly pages: number | null;
  readonly isApproved: boolean;
  readonly imageUrl: string | null;
  readonly createdAt: Date;
  readonly authorIds?: (string | null)[];
  readonly authorNames?: (string | null)[];
  readonly authorApprovals?: (boolean | null)[];
  readonly authorCreatedAtDates?: (Date | null)[];
}
