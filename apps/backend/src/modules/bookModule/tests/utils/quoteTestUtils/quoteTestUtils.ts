import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type QuoteRawEntity } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteRawEntity.js';
import { quotesTable } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { QuoteTestFactory } from '../../factories/quoteTestFactory/quoteTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<QuoteRawEntity> & { readonly user_book_id: string };
}

interface FindByIdPayload {
  readonly id: string;
}

export class QuoteTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, quotesTable);
  }

  private readonly quoteTestFactory = new QuoteTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload): Promise<QuoteRawEntity> {
    const { input } = payload;

    const quote = this.quoteTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<QuoteRawEntity>(quotesTable).insert(quote, '*');

    const rawEntity = rawEntities[0] as QuoteRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<QuoteRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<QuoteRawEntity>(quotesTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
