import { type Language, type BookFormat, type ReadingStatus } from '@common/contracts';

export interface UserBookWithJoinsRawEntity {
  readonly id: string;
  readonly imageUrl: string | null;
  readonly status: ReadingStatus;
  readonly isFavorite: boolean;
  readonly bookshelfId: string;
  readonly createdAt: Date;

  readonly bookId: string;
  readonly title: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly releaseYear: number;
  readonly language: Language;
  readonly translator: string | null;
  readonly format: BookFormat;
  readonly pages: number | null;
  readonly isApproved: boolean;
  readonly bookImageUrl: string | null;
  readonly bookCreatedAt: Date;

  readonly authorIds?: (string | null)[];
  readonly authorNames?: (string | null)[];
  readonly authorApprovals?: (boolean | null)[];
  readonly authorCreatedAtDates?: (Date | null)[];

  readonly genreIds?: (string | null)[];
  readonly genreNames?: (string | null)[];

  readonly collectionIds?: (string | null)[];
  readonly collectionNames?: (string | null)[];
  readonly collectionUserIds?: (string | null)[];
  readonly collectionCreatedAtDates?: (Date | null)[];

  readonly readingIds?: (string | null)[];
  readonly readingStartedAtDates?: (Date | null)[];
  readonly readingEndedAtDates?: (Date | null)[];
  readonly readingRatings?: (number | null)[];
  readonly readingComments?: (string | null)[];
}
