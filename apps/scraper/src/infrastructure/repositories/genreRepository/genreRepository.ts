import { RepositoryError } from '../../../errors/repositoryError.js';
import { type DatabaseClient } from '../../../libs/database/databaseClient.js';
import { type UuidService } from '../../../libs/uuid/uuidService.js';

export interface CreateGenresPayload {
  readonly names: string[];
}

export class GenreRepository {
  private readonly genresTable = 'genres';

  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly uuidService: UuidService,
  ) {}

  public async createGenres(payload: CreateGenresPayload): Promise<void> {
    const { names } = payload;

    const genres = names.map((name) => ({
      id: this.uuidService.generateUuid(),
      name,
    }));

    try {
      await this.databaseClient(this.genresTable).insert(genres).onConflict('name').ignore();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'create',
        originalError: error,
      });
    }
  }
}
