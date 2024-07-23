import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfRawEntity } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { bookshelfTable } from '../../../infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
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

export class BookshelfTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, bookshelfTable);
  }

  private readonly bookshelfTestFactory = new BookshelfTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<BookshelfRawEntity> {
    const { input } = payload;

    const bookshelf = this.bookshelfTestFactory.create(input);

    const rawEntities = await this.databaseClient<BookshelfRawEntity>(bookshelfTable).insert(
      {
        id: bookshelf.getId(),
        name: bookshelf.getName(),
        userId: bookshelf.getUserId(),
        type: bookshelf.getType(),
        createdAt: bookshelf.getCreatedAt(),
      },
      '*',
    );

    const rawEntity = rawEntities[0] as BookshelfRawEntity;

    return {
      ...rawEntity,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async findById(payload: FindByIdPayload): Promise<BookshelfRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookshelfRawEntity>(bookshelfTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return {
      ...rawEntity,
      createdAt: new Date(rawEntity.createdAt),
    };
  }

  public async findByUserId(payload: FindByUserIdPayload): Promise<BookshelfRawEntity[]> {
    const { userId } = payload;

    const rawEntities = await this.databaseClient<BookshelfRawEntity>(bookshelfTable).where({ userId });

    return rawEntities.map((rawEntity) => ({
      ...rawEntity,
      createdAt: new Date(rawEntity.createdAt),
    }));
  }
}
