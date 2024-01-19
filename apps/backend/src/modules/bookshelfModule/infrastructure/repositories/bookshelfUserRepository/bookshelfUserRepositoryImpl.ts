import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { UserTable } from '../../../../userModule/infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import {
  type BookshelfUserRepository,
  type ExistsPayload,
} from '../../../domain/repositories/bookshelfUserRepository/bookshelfUserRepository.js';

export class BookshelfUserRepositoryImpl implements BookshelfUserRepository {
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly loggerService: LoggerService,
  ) {}

  private readonly table = new UserTable();

  public async exists(payload: ExistsPayload): Promise<boolean> {
    const { id } = payload;

    let rawEntity;

    try {
      const result = await this.sqliteDatabaseClient(this.table.name).where(this.table.columns.id, id).first();

      rawEntity = result;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding User by id.',
        context: {
          error,
          source: 'BookshelfUserRepositoryImpl',
        },
      });

      throw new RepositoryError({
        entity: 'User',
        operation: 'find',
      });
    }

    return Boolean(rawEntity);
  }
}
