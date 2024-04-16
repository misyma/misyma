import { Generator } from '../../../../../../tests/generator.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type GenreRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreRawEntity.js';
import { GenreTable } from '../../../infrastructure/databases/bookDatabase/tables/genreTable/genreTable.js';

interface CreateAndPersistPayload {
  readonly input?: {
    genre?: Partial<GenreRawEntity>;
  };
}

export class GenreTestUtils {
  private readonly genreTable = new GenreTable();

  public constructor(private readonly databaseClient: DatabaseClient) {}

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

    await this.databaseClient<GenreRawEntity>(this.genreTable.name).insert(genre);

    return genre;
  }

  public async findByName(name: string): Promise<GenreRawEntity | null> {
    const genre = await this.databaseClient<GenreRawEntity>(this.genreTable.name).where({ name }).first();

    return genre || null;
  }

  public async findById(id: string): Promise<GenreRawEntity | null> {
    const genre = await this.databaseClient<GenreRawEntity>(this.genreTable.name).where({ id }).first();

    return genre || null;
  }

  public async truncate(): Promise<void> {
    await this.databaseClient<GenreRawEntity>(this.genreTable.name).truncate();
  }

  public async destroyDatabaseConnection(): Promise<void> {
    await this.databaseClient.destroy();
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
