import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type UserRawEntity } from '../../../../databaseModule/infrastructure/tables/usersTable/userRawEntity.js';
import { usersTable } from '../../../../databaseModule/infrastructure/tables/usersTable/usersTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { UserTestFactory } from '../../factories/userTestFactory/userTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<UserRawEntity>;
}

interface PersistPayload {
  readonly user: UserRawEntity;
}

interface FindByEmailPayload {
  readonly email: string;
}

interface FindByIdPayload {
  readonly id: string;
}

export class UserTestUtils extends TestUtils {
  private readonly userTestFactory = new UserTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, usersTable.name);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<UserRawEntity> {
    const { input } = payload;

    const user = this.userTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<UserRawEntity>(usersTable.name).insert(user, '*');

    const rawEntity = rawEntities[0] as UserRawEntity;

    return rawEntity;
  }

  public async persist(payload: PersistPayload): Promise<void> {
    const { user } = payload;

    await this.databaseClient<UserRawEntity>(usersTable.name).insert(user, '*');
  }

  public async findByEmail(payload: FindByEmailPayload): Promise<UserRawEntity | undefined> {
    const { email: emailInput } = payload;

    const email = emailInput.toLowerCase();

    const rawEntity = await this.databaseClient<UserRawEntity>(usersTable.name).select('*').where({ email }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }

  public async findById(payload: FindByIdPayload): Promise<UserRawEntity | undefined> {
    const { id } = payload;

    const rawEntity = await this.databaseClient<UserRawEntity>(usersTable.name).select('*').where({ id }).first();

    if (!rawEntity) {
      return undefined;
    }

    return rawEntity;
  }
}
