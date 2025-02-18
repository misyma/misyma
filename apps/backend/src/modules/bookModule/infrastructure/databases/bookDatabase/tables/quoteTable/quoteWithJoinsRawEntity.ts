export interface QuoteWithJoinsRawEntity {
  readonly id: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
  readonly page?: string | undefined;
  readonly bookTitle: string;
  readonly authors: string[];
}
