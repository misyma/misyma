import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { UserBookTable } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookTable.js';
import { UserBookTestFactory } from '../../factories/userBookTestFactory/userBookTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserBookRawEntity>;
}

interface FindByIdPayload {
  readonly id: string;
}

export class UserBookTestUtils {
  private readonly userBookTable = new UserBookTable();
  private readonly userBookTestFactory = new UserBookTestFactory();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserBookRawEntity> {
    const { input } = payload;

    const book = this.userBookTestFactory.createRaw(input);

    let rawEntities: UserBookRawEntity[] = [];

    rawEntities = await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name).insert(book, '*');

    return rawEntities[0] as UserBookRawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserBookRawEntity> {
    const { id } = payload;

    const bookRawEntity = await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name)
      .select('*')
      .where({ id })
      .first();

    return bookRawEntity as UserBookRawEntity;
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient<UserBookRawEntity>(this.userBookTable.name).truncate();
  }
}
