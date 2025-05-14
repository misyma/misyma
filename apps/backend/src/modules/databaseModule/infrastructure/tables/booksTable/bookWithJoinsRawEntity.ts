import { type Language, type BookFormat } from '@common/contracts';

export interface BookWithJoinsRawEntity {
  readonly id: string;
  readonly title: string;
  readonly category_id: string;
  readonly category_name: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly release_year: number;
  readonly language: Language;
  readonly translator: string | null;
  readonly format?: BookFormat | undefined | null;
  readonly pages: number | null;
  readonly is_approved: boolean;
  readonly image_url: string | null;
  readonly author_ids?: (string | null)[];
  readonly author_names?: (string | null)[];
  readonly author_approvals?: (boolean | null)[];
}
