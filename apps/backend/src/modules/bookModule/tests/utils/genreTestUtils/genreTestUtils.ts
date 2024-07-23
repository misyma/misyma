import { Generator } from '../../../../../../tests/generator.js';
import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type GenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreRawEntity.js';
import { genreTable } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreTable.js';

interface CreateAndPersistPayload {
  readonly input?: {
    readonly genre?: Partial<GenreRawEntity>;
  };
}

export class GenreTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, genreTable);
  }

  public async createAndPersist(payload: CreateAndPersistPayload = {}): Promise<GenreRawEntity> {
    const { input } = payload;

    let genre: GenreRawEntity;

    if (input?.genre?.name) {
      genre = {
        id: Generator.uuid(),
        name: input.genre.name,
      };
    } else {
      genre = {
        id: Generator.uuid(),
        name: await this.getNonClashingName(),
        ...input?.genre,
      };
    }

    await this.databaseClient<GenreRawEntity>(genreTable).insert(genre);

    return genre;
  }

  public async findByName(name: string): Promise<GenreRawEntity | null> {
    const genre = await this.databaseClient<GenreRawEntity>(genreTable).where({ name }).first();

    return genre || null;
  }

  public async findById(id: string): Promise<GenreRawEntity | null> {
    const genre = await this.databaseClient<GenreRawEntity>(genreTable).where({ id }).first();

    return genre || null;
  }

  private async getNonClashingName(): Promise<string> {
    const name = Generator.word();

    const genre = await this.findByName(name);

    if (genre) {
      return await this.getNonClashingName();
    }

    return name;
  }
}
