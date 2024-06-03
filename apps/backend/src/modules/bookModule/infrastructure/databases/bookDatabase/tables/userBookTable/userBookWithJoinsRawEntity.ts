import { type Language, type BookFormat, type ReadingStatus } from '@common/contracts';

export interface UserBookWithJoinsRawEntity {
  readonly id: string;
  readonly imageUrl: string | null;
  readonly status: ReadingStatus;
  readonly isFavorite: boolean;
  readonly bookshelfId: string;

  readonly bookId: string;
  readonly title: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly releaseYear: number | null;
  readonly language: Language;
  readonly translator: string | null;
  readonly format: BookFormat;
  readonly pages: number | null;
  readonly isApproved: boolean;
  readonly bookImageUrl: string | null;

  readonly authorId: string | null;
  readonly authorName: string | null;
  readonly isAuthorApproved: boolean | null;

  readonly genreId: string | null;
  readonly genreName: string | null;
  readonly userId: string | null;

  readonly collectionId: string | null;
  readonly collectionName: string | null;

  readonly readingId: string | null;
  readonly readingStartedAt: Date | null;
  readonly readingEndedAt: Date | null;
  readonly readingRating: number | null;
  readonly readingComment: string | null;
}
