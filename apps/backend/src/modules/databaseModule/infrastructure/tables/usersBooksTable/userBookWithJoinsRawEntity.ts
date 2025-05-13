import { type Language, type BookFormat, type ReadingStatus } from '@common/contracts';

export interface UserBookWithJoinsRawEntity {
  readonly id: string;
  readonly image_url: string | null;
  readonly status: ReadingStatus;
  readonly is_favorite: boolean;
  readonly bookshelf_id: string;
  readonly created_at: Date;

  readonly category_id: string;
  readonly category_name: string;
  readonly book_id: string;
  readonly title: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly release_year: number;
  readonly language: Language;
  readonly translator: string | null;
  readonly format?: BookFormat | null | undefined;
  readonly pages: number | null;
  readonly is_approved: boolean;
  readonly book_image_url: string | null;

  readonly author_ids?: (string | null)[];
  readonly author_names?: (string | null)[];
  readonly author_approvals?: (boolean | null)[];

  readonly latest_rating?: number | null;
}
