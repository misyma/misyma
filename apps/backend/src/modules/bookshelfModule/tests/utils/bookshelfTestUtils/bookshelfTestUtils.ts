import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { BookshelfTable } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { BookshelfTestFactory } from '../../factories/bookshelfTestFactory/bookshelfTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookshelfRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class BookshelfTestUtils {
  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private readonly table = new BookshelfTable();

  private readonly bookshelfTestFactory = new BookshelfTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookshelfRawEntity> {
    const { input } = payload;

    const bookshelf = this.bookshelfTestFactory.create(input);

    const rawEntities = await this.sqliteDatabaseClient<BookshelfRawEntity>(this.table.name).insert(
      {
        id: bookshelf.getId(),
        name: bookshelf.getName(),
        userId: bookshelf.getUserId(),
        addressId: bookshelf.getAddressId(),
        imageUrl: bookshelf.getImageUrl(),
      },
      '*',
    );

    return rawEntities[0] as BookshelfRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookshelfRawEntity | null> {
    const { id } = payload;

    const result = await this.sqliteDatabaseClient<BookshelfRawEntity>(this.table.name).where({ id }).first();

    if (!result) {
      return null;
    }

    return result;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<BookshelfRawEntity>(this.table.name).truncate();
  }
}
