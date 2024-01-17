import { type BookshelfRepository } from './domain/repositories/bookshelfRepository.js';
import { BookshelfRepositoryImpl } from './infrastructure/repositories/bookshelfRepository/bookshelfRepositoryImpl.js';
import { type BookshelfMapper } from './infrastructure/repositories/mappers/bookshelfMapper/bookshelfMapper.js';
import { BookshelfMapperImpl } from './infrastructure/repositories/mappers/bookshelfMapper/bookshelfMapperImpl.js';
import { symbols } from './symbols.js';
import { type SqliteDatabaseClient } from '../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';

export class BookshelfModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<BookshelfMapper>(symbols.bookshelfMapper, () => new BookshelfMapperImpl());

    container.bind<BookshelfRepository>(
      symbols.bookshelfRepository,
      () =>
        new BookshelfRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<BookshelfMapper>(symbols.bookshelfMapper),
          container.get<UuidService>(coreSymbols.uuidService),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }
}
