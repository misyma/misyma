import { BookshelfHttpController } from './api/httpControllers/bookshelfHttpController/bookshelfHttpController.js';
import { type CreateBookshelfCommandHandler } from './application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandler.js';
import { CreateBookshelfCommandHandlerImpl } from './application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandlerImpl.js';
import { type UpdateBookshelfNameCommandHandler } from './application/commandHandlers/updateBookshelfNameCommandHandler/updateBookshelfNameCommandHandler.js';
import { UpdateBookshelfNameCommandHandlerImpl } from './application/commandHandlers/updateBookshelfNameCommandHandler/updateBookshelfNameCommandHandlerImpl.js';
import { type FindBookshelfByIdQueryHandler } from './application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { FindBookshelfByIdQueryHandlerImpl } from './application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandlerImpl.js';
import { type FindBookshelvesByUserIdQueryHandler } from './application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandler.js';
import { FindBookshelvesByUserIdQueryHandlerImpl } from './application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandlerImpl.js';
import { type BookshelfRepository } from './domain/repositories/bookshelfRepository/bookshelfRepository.js';
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
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';
import { type UserRepository } from '../userModule/domain/repositories/userRepository/userRepository.js';
import { userSymbols } from '../userModule/symbols.js';

export class BookshelfModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<BookshelfMapper>(symbols.bookshelfMapper, () => new BookshelfMapperImpl());

    this.bindRepositories(container);

    this.bindQueryHandlers(container);

    this.bindCommandHandlers(container);

    container.bind<BookshelfHttpController>(
      symbols.bookshelfHttpController,
      () =>
        new BookshelfHttpController(
          container.get<FindBookshelvesByUserIdQueryHandler>(symbols.findBookshelvesByUserIdQueryHandler),
          container.get<FindBookshelfByIdQueryHandler>(symbols.findBookshelfByIdQueryHandler),
          container.get<CreateBookshelfCommandHandler>(symbols.createBookshelfCommandHandler),
          container.get<UpdateBookshelfNameCommandHandler>(symbols.updateBookshelfNameCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }

  private bindRepositories(container: DependencyInjectionContainer): void {
    container.bind<BookshelfRepository>(
      symbols.bookshelfRepository,
      () =>
        new BookshelfRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<BookshelfMapper>(symbols.bookshelfMapper),
          container.get<UuidService>(coreSymbols.uuidService),
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
          container.get<UserRepository>(userSymbols.userRepository),
        ),
    );
  }

  private bindCommandHandlers(container: DependencyInjectionContainer): void {
    container.bind<CreateBookshelfCommandHandler>(
      symbols.createBookshelfCommandHandler,
      () =>
        new CreateBookshelfCommandHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<UserRepository>(userSymbols.userRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UpdateBookshelfNameCommandHandler>(
      symbols.updateBookshelfNameCommandHandler,
      () =>
        new UpdateBookshelfNameCommandHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }
}
