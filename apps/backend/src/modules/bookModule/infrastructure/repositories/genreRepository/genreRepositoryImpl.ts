import { type GenreMapper } from './genreMapper/genreMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { Genre, type GenreState } from '../../../domain/entities/genre/genre.js';
import {
  type FindGenrePayload,
  type GenreRepository,
  type FindGenres,
  type SaveGenrePayload,
  type DeleteGenrePayload,
} from '../../../domain/repositories/genreRepository/genreRepository.js';
import { type GenreRawEntity } from '../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';
import { GenreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';

type CreateGenrePayload = { genre: GenreState };

type UpdateGenrePayload = { genre: Genre };

export class GenreRepositoryImpl implements GenreRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly genreMapper: GenreMapper,
    private readonly uuidService: UuidService,
  ) {}

  private readonly genreTable = new GenreTable();

  public async findGenre(payload: FindGenrePayload): Promise<Genre | null> {
    const { id, name } = payload;

    let rawEntity: GenreRawEntity | undefined;

    let whereCondition: Partial<GenreRawEntity> = {};

    if (id) {
      whereCondition = {
        ...whereCondition,
        id,
      };
    }

    if (name) {
      whereCondition = {
        ...whereCondition,
        name,
      };
    }

    try {
      rawEntity = await this.databaseClient<GenreRawEntity>(this.genreTable.name)
        .select('*')
        .where(whereCondition)
        .first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.genreMapper.mapToDomain(rawEntity);
  }

  public async findGenres(payload: FindGenres): Promise<Genre[]> {
    const { ids, page, pageSize } = payload;

    let rawEntities: GenreRawEntity[];

    const query = this.databaseClient<GenreRawEntity>(this.genreTable.name)
      .select('*')
      .limit(pageSize)
      .offset(pageSize * (page - 1));

    if (ids) {
      query.whereIn('id', ids);
    }

    try {
      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.genreMapper.mapToDomain(rawEntity));
  }

  public async saveGenre(payload: SaveGenrePayload): Promise<Genre> {
    const { genre } = payload;

    if (genre instanceof Genre) {
      return this.update({ genre });
    }

    return this.create({ genre });
  }

  private async create(payload: CreateGenrePayload): Promise<Genre> {
    const {
      genre: { name },
    } = payload;

    let rawEntities: GenreRawEntity[];

    try {
      rawEntities = await this.databaseClient<GenreRawEntity>(this.genreTable.name)
        .insert({
          id: this.uuidService.generateUuid(),
          name,
        })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'create',
        error,
      });
    }

    const rawEntity = rawEntities[0] as GenreRawEntity;

    return this.genreMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateGenrePayload): Promise<Genre> {
    const { genre } = payload;

    let rawEntities: GenreRawEntity[];

    try {
      rawEntities = await this.databaseClient<GenreRawEntity>(this.genreTable.name)
        .update(genre.getState())
        .where({ id: genre.getId() })
        .returning('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'update',
        error,
      });
    }

    const rawEntity = rawEntities[0] as GenreRawEntity;

    return this.genreMapper.mapToDomain(rawEntity);
  }

  public async deleteGenre(payload: DeleteGenrePayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<GenreRawEntity>(this.genreTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'Genre',
        operation: 'delete',
        error,
      });
    }
  }

  public async countGenres(payload: FindGenres): Promise<number> {
    const { ids } = payload;

    try {
      const query = this.databaseClient<GenreRawEntity>(this.genreTable.name);

      if (ids) {
        query.whereIn('id', ids);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count(*)'];

      if (count === undefined) {
        throw new ResourceNotFoundError({
          resource: 'Genre',
          operation: 'count',
        });
      }

      if (typeof count === 'string') {
        return parseInt(count, 10);
      }

      return count;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Book',
        operation: 'count',
        error,
      });
    }
  }
}
