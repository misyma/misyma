import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type QuoteRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';
import { quoteTable } from '../../../infrastructure/databases/bookDatabase/tables/quoteTable/quoteTable.js';
import { QuoteTestFactory } from '../../factories/quoteTestFactory/quoteTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<QuoteRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class QuoteTestUtils {
  public constructor(private readonly databaseClient: DatabaseClient) {}

  private readonly quoteTestFactory = new QuoteTestFactory();

  public async createAndPersist(payload: CreateAndPersistPayload = { input: {} }): Promise<QuoteRawEntity> {
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

    return {
      id: rawEntity.id,
      userBookId: rawEntity.userBookId,
      content: rawEntity.content,
      createdAt: new Date(rawEntity.createdAt),
      isFavorite: Boolean(rawEntity.isFavorite),
      page: rawEntity.page,
    };
  }

  public async findById(payload: FindByIdPayload): Promise<QuoteRawEntity | null> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<QuoteRawEntity>(quoteTable).where({ id }).first();

    if (!rawEntity) {
      return null;
    }

    return {
      id: rawEntity.id,
      userBookId: rawEntity.userBookId,
      content: rawEntity.content,
      createdAt: new Date(rawEntity.createdAt),
      isFavorite: Boolean(rawEntity.isFavorite),
      page: rawEntity.page,
    };
  }

  public async truncate(): Promise<void> {
    await this.databaseClient(quoteTable).truncate();
  }
}
