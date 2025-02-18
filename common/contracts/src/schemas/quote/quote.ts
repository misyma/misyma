export interface Quote {
  readonly id: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: string;
  readonly page?: string;
  readonly bookTitle?: string;
  readonly authors?: string[];
}
