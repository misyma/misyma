export interface BookshelfRawEntity {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly address?: string | undefined;
  readonly imageUrl?: string | undefined;
}
