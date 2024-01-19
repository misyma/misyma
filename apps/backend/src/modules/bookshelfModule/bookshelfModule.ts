import { type CreateBookshelfCommandHandler } from './application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandler.js';
import { CreateBookshelfCommandHandlerImpl } from './application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandlerImpl.js';
import { type FindBookshelfByIdQueryHandler } from './application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { FindBookshelfByIdQueryHandlerImpl } from './application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandlerImpl.js';
import { type FindBookshelvesByUserIdQueryHandler } from './application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandler.js';
import { FindBookshelvesByUserIdQueryHandlerImpl } from './application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandlerImpl.js';
import { type BookshelfRepository } from './domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookshelfUserRepository } from './domain/repositories/bookshelfUserRepository/bookshelfUserRepository.js';
import { BookshelfRepositoryImpl } from './infrastructure/repositories/bookshelfRepository/bookshelfRepositoryImpl.js';
import { BookshelfUserRepositoryImpl } from './infrastructure/repositories/bookshelfUserRepository/bookshelfUserRepositoryImpl.js';
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

    this.bindRepositories(container);

    this.bindQueryHandlers(container);

    this.bindCommandHandlers(container);
  }

  private bindRepositories(container: DependencyInjectionContainer): void {
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

    container.bind<BookshelfUserRepository>(
      symbols.bookshelfUserRepository,
      () =>
        new BookshelfUserRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }

  private bindQueryHandlers(container: DependencyInjectionContainer): void {
    container.bind<FindBookshelfByIdQueryHandler>(
      symbols.findBookshelfByIdQueryHandler,
      () => new FindBookshelfByIdQueryHandlerImpl(container.get<BookshelfRepository>(symbols.bookshelfRepository)),
    );

    container.bind<FindBookshelvesByUserIdQueryHandler>(
      symbols.findBookshelvesByUserIdQueryHandler,
      () =>
        new FindBookshelvesByUserIdQueryHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<BookshelfUserRepository>(symbols.bookshelfUserRepository),
        ),
    );
  }

  private bindCommandHandlers(container: DependencyInjectionContainer): void {
    container.bind<CreateBookshelfCommandHandler>(
      symbols.createBookshelfCommandHandler,
      () =>
        new CreateBookshelfCommandHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<BookshelfUserRepository>(symbols.bookshelfUserRepository),
        ),
    );
  }
}
