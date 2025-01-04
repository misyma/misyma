import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type GenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreRawEntity.js';
import { genreTable } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreTable.js';
import { GenreTestFactory } from '../../factories/genreTestFactory/genreTestFactory.js';

interface CreateAndPersistPayload {
  readonly input?: Partial<GenreRawEntity>;
}

export class GenreTestUtils extends TestUtils {
  private readonly genreTestFactory = new GenreTestFactory();

  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, genreTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<GenreRawEntity> {
    const { input } = payload;

    const data = this.genreTestFactory.createRaw(input);

    const rawEntities = await this.databaseClient<GenreRawEntity>(genreTable).insert(data, '*');

    const rawEntity = rawEntities[0] as GenreRawEntity;

    return rawEntity;
  }

  public async findByName(name: string): Promise<GenreRawEntity | null> {
    const genre = await this.databaseClient<GenreRawEntity>(genreTable).where({ name }).first();

    return genre || null;
  }

  public async findById(id: string): Promise<GenreRawEntity | null> {
    const genre = await this.databaseClient<GenreRawEntity>(genreTable).where({ id }).first();

    return genre || null;
  }
}
