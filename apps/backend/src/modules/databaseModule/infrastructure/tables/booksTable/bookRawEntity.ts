import { type Language, type BookFormat } from '@common/contracts';

export interface BookRawEntity {
  readonly id: string;
  readonly category_id: string;
  readonly title: string;
  readonly isbn?: string | undefined | null;
  readonly publisher?: string | undefined | null;
  readonly release_year: number;
  readonly language: Language;
  readonly translator?: string | undefined | null;
  readonly format?: BookFormat | undefined | null;
  readonly pages?: number | undefined | null;
  readonly is_approved: boolean;
  readonly image_url?: string | undefined | null;
}
