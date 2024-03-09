export interface Bookshelf {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly addressId?: string | undefined;
  readonly imageUrl?: string | undefined;
}
