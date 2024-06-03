import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type UserBookCollectionRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsRawEntity.js';
import { UserBookCollectionsTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookCollectionsTable/userBookCollectionsTable.js';
import { type UserBookGenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookGenresTable/userBookGenresRawEntity.js';
import { UserBookGenreTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookGenresTable/userBookGenresTable.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { UserBookTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookTable.js';
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

export class UserBookTestUtils {
  private readonly userBookTable = new UserBookTable();
  private readonly userBookGenresTable = new UserBookGenreTable();
  private readonly userBookCollectionTable = new UserBookCollectionsTable();
  private readonly userBookTestFactory = new UserBookTestFactory();

  public constructor(private readonly databaseClient: DatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserBookRawEntity> {
    const { input, genreIds, collectionIds } = payload;

    const userBook = this.userBookTestFactory.createRaw(input);

    let rawEntities: UserBookRawEntity[] = [];

    await this.databaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<UserBookRawEntity>(this.userBookTable.name).insert(userBook, '*');

      if (genreIds) {
        await transaction.batchInsert<UserBookGenreRawEntity>(
          this.userBookGenresTable.name,
          genreIds.map((genreId) => ({
            genreId,
            userBookId: userBook.id,
          })),
        );
      }

      if (collectionIds) {
        await transaction.batchInsert<UserBookCollectionRawEntity>(
          this.userBookCollectionTable.name,
          collectionIds.map((collectionId) => ({
            collectionId,
            userBookId: userBook.id,
          })),
        );
      }
    });

    const userBookRawEntity = rawEntities[0] as UserBookRawEntity;

    return {
      ...userBookRawEntity,
      isFavorite: Boolean(userBookRawEntity.isFavorite),
    };
  }

  public async findById(payload: FindByIdPayload): Promise<UserBookRawEntity | undefined> {
    const { id } = payload;

    const userBookRawEntity = await this.databaseClient<UserBookRawEntity>(this.userBookTable.name)
      .select('*')
      .where({ id })
      .first();

    if (!userBookRawEntity) {
      return undefined;
    }

    return {
      ...userBookRawEntity,
      isFavorite: Boolean(userBookRawEntity.isFavorite),
    };
  }

  public async findByIds(payload: FindByIdsPayload): Promise<UserBookRawEntity[]> {
    const { ids } = payload;

    const rawEntities = await this.databaseClient<UserBookRawEntity>(this.userBookTable.name)
      .select('*')
      .whereIn('id', ids);

    return rawEntities.map((rawEntity) => ({
      ...rawEntity,
      isFavorite: Boolean(rawEntity.isFavorite),
    }));
  }

  public async findUserBookGenres(payload: FindUserBookGenresPayload): Promise<UserBookGenreRawEntity[]> {
    const { userBookId } = payload;

    const rawEntities = await this.databaseClient<UserBookGenreRawEntity>(this.userBookGenresTable.name)
      .select('*')
      .where({ userBookId });

    return rawEntities;
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<UserBookRawEntity>(this.userBookTable.name).truncate();
  }
}
