export interface QuoteRawEntity {
  readonly id: string;
  readonly user_book_id: string;
  readonly content: string;
  readonly is_favorite: boolean;
  readonly created_at: Date;
  readonly page?: string | undefined;
}
