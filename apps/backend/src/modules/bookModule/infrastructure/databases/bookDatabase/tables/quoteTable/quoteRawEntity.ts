export interface QuoteRawEntity {
  readonly id: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
  readonly page?: string | undefined;
}
