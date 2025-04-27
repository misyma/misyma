import { type BookshelfType } from '@common/contracts';

export interface BookshelfWithJoinsRawEntity {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly type: BookshelfType;
  readonly createdAt: Date;
  readonly imageUrl?: string | undefined | null;
  readonly bookCount: string;
}
