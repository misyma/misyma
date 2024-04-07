import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type UserBookGenresRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookGenresTable/userBookGenresRawEntity.js';
import { UserBookGenresTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookGenresTable/userBookGenresTable.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { UserBookTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookTable.js';
import { UserBookTestFactory } from '../../factories/userBookTestFactory/userBookTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserBookRawEntity>;
  readonly genreIds?: string[];
}

interface FindUserBookGenresPayload {
  readonly userBookId: string;
}

interface FindByIdPayload {
  readonly id: string;
}

export class UserBookTestUtils {
  private readonly userBookTable = new UserBookTable();
  private readonly userBookGenresTable = new UserBookGenresTable();
  private readonly userBookTestFactory = new UserBookTestFactory();

  public constructor(private readonly databaseClient: DatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserBookRawEntity> {
    const { input, genreIds } = payload;

    const userBook = this.userBookTestFactory.createRaw(input);

    let rawEntities: UserBookRawEntity[] = [];

    await this.databaseClient.transaction(async (transaction: Transaction) => {
      rawEntities = await transaction<UserBookRawEntity>(this.userBookTable.name).insert(userBook, '*');

      if (genreIds) {
        await transaction.batchInsert<UserBookGenresRawEntity>(
          this.userBookGenresTable.name,
          genreIds.map((genreId) => ({
            genreId,
            userBookId: userBook.id,
          })),
        );
      }
    });

    return rawEntities[0] as UserBookRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserBookRawEntity> {
    const { id } = payload;

    const bookRawEntity = await this.databaseClient<UserBookRawEntity>(this.userBookTable.name)
      .select('*')
      .where({ id })
      .first();

    return bookRawEntity as UserBookRawEntity;
  }

  public async findUserBookGenres(payload: FindUserBookGenresPayload): Promise<UserBookGenresRawEntity[]> {
    const { userBookId } = payload;

    const rawEntities = await this.databaseClient<UserBookGenresRawEntity>(this.userBookGenresTable.name)
      .select('*')
      .where({ userBookId });

    return rawEntities;
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<UserBookRawEntity>(this.userBookTable.name).truncate();
  }
}
