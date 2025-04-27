import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type QuoteRawEntity } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteRawEntity.js';
import { quoteTable } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { QuoteTestFactory } from '../../factories/quoteTestFactory/quoteTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<QuoteRawEntity> & { readonly userBookId: string };
}

interface FindByIdPayload {
  readonly id: string;
}

export class QuoteTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, quoteTable);
  }

  private readonly quoteTestFactory = new QuoteTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload): Promise<QuoteRawEntity> {
    const { input } = payload;

    const quote = this.quoteTestFactory.create(input);

    const rawEntities = await this.databaseClient<QuoteRawEntity>(quoteTable).insert(
      {
        id: quote.getId(),
        userBookId: quote.getUserBookId(),
        content: quote.getContent(),
        createdAt: quote.getCreatedAt(),
        isFavorite: quote.getIsFavorite(),
        page: quote.getPage() as string,
      },
      '*',
    );

    const rawEntity = rawEntities[0] as QuoteRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<QuoteRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<QuoteRawEntity>(quoteTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return rawEntity;
  }
}
