export interface BookshelfRawEntity {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly addressId?: string | undefined;
}
