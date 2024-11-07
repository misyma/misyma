import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type UserBookCollectionRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import { userBookCollectionTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookGenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookGenresTable/userBookGenresRawEntity.js';
import { userBookGenreTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookGenresTable/userBookGenresTable.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { userBookTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookTable.js';
import { UserBookTestFactory } from '../../factories/userBookTestFactory/userBookTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserBookRawEntity>;
  readonly genreIds?: string[];
  readonly collectionIds?: string[];
}

interface FindUserBookGenresPayload {
  readonly userBookId: string;
}

interface FindByIdPayload {
  readonly id: string;
}

interface FindByIdsPayload {
  readonly ids: string[];
}

export class UserBookTestUtils extends TestUtils {
  private readonly userBookTestFactory = new UserBookTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, userBookTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserBookRawEntity> {
    const { input, genreIds, collectionIds } = payload;

    const userBook = this.userBookTestFactory.createRaw(input);

    let rawEntities: UserBookRawEntity[] = [];

    await this.databaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<UserBookRawEntity>(userBookTable).insert(userBook, '*');

      if (genreIds) {
        await transaction.batchInsert<UserBookGenreRawEntity>(
          userBookGenreTable,
          genreIds.map((genreId) => ({
            genreId,
            userBookId: userBook.id,
          })),
        );
      }

      if (collectionIds) {
        await transaction.batchInsert<UserBookCollectionRawEntity>(
          userBookCollectionTable,
          collectionIds.map((collectionId) => ({
            collectionId,
            userBookId: userBook.id,
          })),
        );
      }
    });

    const rawEntity = rawEntities[0] as UserBookRawEntity;

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserBookRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<UserBookRawEntity>(userBookTable).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }

  public async findByIds(payload: FindByIdsPayload): Promise<UserBookRawEntity[]> {
    const { ids } = payload;

    const rawEntities = await this.databaseClient<UserBookRawEntity>(userBookTable).select('*').whereIn('id', ids);

    return rawEntities;
  }

  public async findUserBookGenres(payload: FindUserBookGenresPayload): Promise<UserBookGenreRawEntity[]> {
    const { userBookId } = payload;

    const rawEntities = await this.databaseClient<UserBookGenreRawEntity>(userBookGenreTable)
      .select('*')
      .where({ userBookId });

    return rawEntities;
  }
}
