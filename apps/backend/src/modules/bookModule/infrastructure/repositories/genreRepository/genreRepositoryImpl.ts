import { type GenreMapper } from './genreMapper/genreMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';
import {
  type FindByNamePayload,
  type FindByIdPayload,
  type GenreRepository,
  type CreatePayload,
  type FindManyByIds,
} from '../../../domain/repositories/genreRepository/genreRepository.js';
import { type GenreRawEntity } from '../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';
import { GenreTable } from '../../databases/bookDatabase/tables/genreTable/genreTable.js';

interface GetQueryBuilderPayload {
  transaction?: Transaction;
}

interface LogErrorPayload {
  operation: string;
  error: unknown;
}

export class GenreRepositoryImpl implements GenreRepository {
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly genreMapper: GenreMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  private readonly genreTable = new GenreTable();

  private getQueryBuilder(payload?: GetQueryBuilderPayload): QueryBuilder<GenreRawEntity> {
    if (payload?.transaction) {
      return this.sqliteDatabaseClient(this.genreTable.name).transacting(payload.transaction);
    }

    return this.sqliteDatabaseClient<GenreRawEntity>(this.genreTable.name);
  }

  public async findAll(): Promise<Genre[]> {
    let rawEntities: GenreRawEntity[];

    try {
      rawEntities = await this.getQueryBuilder().select('*');
    } catch (error) {
      this.logError({
        operation: 'findAll',
        error,
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.genreMapper.toDomain(rawEntity));
  }

  public async findById(payload: FindByIdPayload): Promise<Genre | null> {
    const { id } = payload;

    let rawEntity: GenreRawEntity | undefined;

    try {
      rawEntity = await this.getQueryBuilder().select('*').where(this.genreTable.columns.id, id).first();
    } catch (error) {
      this.logError({
        operation: 'findById',
        error,
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.genreMapper.toDomain(rawEntity);
  }

  public async findManyByIds(payload: FindManyByIds): Promise<Genre[]> {
    const { ids } = payload;

    let rawEntities: GenreRawEntity[];

    try {
      rawEntities = await this.getQueryBuilder().select('*').whereIn(this.genreTable.columns.id, ids);
    } catch (error) {
      this.logError({
        error,
        operation: 'findManyByIds',
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.genreMapper.toDomain(rawEntity));
  }

  public async findByName(payload: FindByNamePayload): Promise<Genre | null> {
    const { name } = payload;

    let rawEntity: GenreRawEntity | undefined;

    try {
      rawEntity = await this.getQueryBuilder().select('*').where(this.genreTable.columns.name, name).first();
    } catch (error) {
      this.logError({
        operation: 'findById',
        error,
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.genreMapper.toDomain(rawEntity);
  }

  public async create(payload: CreatePayload): Promise<Genre> {
    const { name } = payload;

    let rawEntities: GenreRawEntity[];

    try {
      rawEntities = await this.getQueryBuilder()
        .insert({
          id: this.uuidService.generateUuid(),
          name,
        })
        .returning('*');
    } catch (error) {
      this.logError({
        error,
        operation: 'create',
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'create',
      });
    }

    const rawEntity = rawEntities[0];

    if (!rawEntity) {
      this.logError({
        error: 'Created entity not returned correctly.',
        operation: 'create',
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'create',
      });
    }

    return this.genreMapper.toDomain(rawEntity);
  }

  public async update(payload: Genre): Promise<Genre> {
    let rawEntities: GenreRawEntity[];

    try {
      rawEntities = await this.getQueryBuilder()
        .update({
          name: payload.getName(),
        })
        .where(this.genreTable.columns.id, payload.getId())
        .returning('*');
    } catch (error) {
      this.logError({
        error,
        operation: 'update',
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'update',
      });
    }

    const rawEntity = rawEntities[0];

    if (!rawEntity) {
      this.logError({
        error: 'Updated entity not returned correctly.',
        operation: 'update',
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'update',
      });
    }

    return this.genreMapper.toDomain(rawEntity);
  }

  public async delete(payload: Genre): Promise<void> {
    try {
      await this.getQueryBuilder().delete().where(this.genreTable.columns.id, payload.getId());
    } catch (error) {
      this.logError({
        error,
        operation: 'delete',
      });

      throw new RepositoryError({
        entity: 'Genre',
        operation: 'delete',
      });
    }
  }

  private logError(payload: LogErrorPayload): void {
    const { error, operation } = payload;

    if (error instanceof Error) {
      this.loggerService.error({
        message: error.message,
        context: {
          operation,
          repository: 'GenreRepositoryImpl',
          stack: error.stack,
        },
      });
    } else {
      this.loggerService.error({
        message: 'An error occurred.',
        context: {
          operation,
          repository: 'GenreRepositoryImpl',
          error,
        },
      });
    }
  }
}
