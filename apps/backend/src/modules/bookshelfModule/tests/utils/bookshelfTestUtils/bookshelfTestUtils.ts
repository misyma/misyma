import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { BookshelfTable } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { BookshelfTestFactory } from '../../factories/bookshelfTestFactory/bookshelfTestFactory.js';

interface CreateAndPersistPayload {
  input?: Partial<BookshelfRawEntity>;
}

interface FindByIdPayload {
  id: string;
}

export class BookshelfTestUtils {
  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private readonly table = new BookshelfTable();

  private readonly bookshelfTestFactory = BookshelfTestFactory.createFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookshelfRawEntity> {
    const { input } = payload;

    const bookshelf = this.bookshelfTestFactory.create(input);

    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(
      {
        id: bookshelf.getId(),
        name: bookshelf.getName(),
        userId: bookshelf.getUserId(),
        addressId: bookshelf.getAddressId(),
      },
      '*',
    );

    return rawEntities[0] as BookshelfRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookshelfRawEntity | null> {
    const { id } = payload;

    const result = await this.createQueryBuilder().where(this.table.columns.id, id).first();

    if (!result) {
      return null;
    }

    return result;
  }

  private createQueryBuilder(): QueryBuilder<BookshelfRawEntity> {
    return this.sqliteDatabaseClient(this.table.name);
  }

  public async truncate(): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    await queryBuilder.truncate();
  }
}
