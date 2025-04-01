import { RepositoryError } from '../../../errors/repositoryError.js';
import { type DatabaseClient } from '../../../libs/database/databaseClient.js';
import { type UuidService } from '../../../libs/uuid/uuidService.js';
import { type Genre } from '../../entities/genre/genre.js';

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

  public async findGenres(): Promise<Genre[]> {
    try {
      const genres = await this.databaseClient<Genre>(this.genresTable).select('*');

      return genres;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'findMany',
        originalError: error,
      });
    }
  }
}
