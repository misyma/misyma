import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { BookshelfTable } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { BookshelfTestFactory } from '../../factories/bookshelfTestFactory/bookshelfTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<BookshelfRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindByUserIdPayload {
  readonly userId: string;
}

export class BookshelfTestUtils {
  public constructor(private readonly databaseClient: DatabaseClient) {}

  private readonly table = new BookshelfTable();

  private readonly bookshelfTestFactory = new BookshelfTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookshelfRawEntity> {
    const { input } = payload;

    const bookshelf = this.bookshelfTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookshelfRawEntity>(this.table.name).insert(
      {
        id: bookshelf.getId(),
        name: bookshelf.getName(),
        userId: bookshelf.getUserId(),
        type: bookshelf.getType(),
      },
      '*',
    );

    return rawEntities[0] as BookshelfRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookshelfRawEntity | null> {
    const { id } = payload;

    const result = await this.databaseClient<BookshelfRawEntity>(this.table.name).where({ id }).first();

    if (!result) {
      return null;
    }

    return result;
  }

  public async findByUserId(payload: FindByUserIdPayload): Promise<BookshelfRawEntity[]> {
    const { userId } = payload;

    const result = await this.databaseClient<BookshelfRawEntity>(this.table.name).where({ userId });

    return result;
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<BookshelfRawEntity>(this.table.name).truncate();
  }
}
