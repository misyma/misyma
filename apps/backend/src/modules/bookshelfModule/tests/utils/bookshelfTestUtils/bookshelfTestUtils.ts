import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookshelfRawEntity } from '../../../../databaseModule/infrastructure/tables/bookshelvesTable/bookshelfRawEntity.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelvesTable/bookshelvesTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { BookshelfTestFactory } from '../../factories/bookshelfTestFactory/bookshelfTestFactory.js';

export interface CreateAndPersistBookshelfPayload {
  readonly input?: Partial<BookshelfRawEntity> & { readonly user_id: string };
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindByUserIdPayload {
  readonly userId: string;
}

export class BookshelfTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, bookshelvesTable);
  }

  private readonly bookshelfTestFactory = new BookshelfTestFactory();

  public async createAndPersist(payload: CreateAndPersistBookshelfPayload): Promise<BookshelfRawEntity> {
    const { input } = payload;

    const bookshelf = this.bookshelfTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<BookshelfRawEntity>(bookshelvesTable).insert(bookshelf, '*');

    const rawEntity = rawEntities[0] as BookshelfRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<BookshelfRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<BookshelfRawEntity>(bookshelvesTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }

  public async findByUserId(payload: FindByUserIdPayload): Promise<BookshelfRawEntity[]> {
    const { userId } = payload;

    const rawEntities = await this.databaseClient<BookshelfRawEntity>(bookshelvesTable).where({ user_id: userId });

    return rawEntities;
  }
}
