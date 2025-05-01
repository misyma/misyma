import { type Language, type BookFormat } from '@common/contracts';

export interface BookChangeRequestWithJoinsRawEntity {
  readonly id: string;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly release_year?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly image_url?: string | undefined;
  readonly author_ids?: string | undefined;
  readonly book_id: string;
  readonly user_email: string;
  readonly created_at: Date;
  readonly book_title: string;
  readonly changed_fields: string;
}
