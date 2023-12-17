import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController.js';
import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController.js';
import { type CreateAuthorCommandHandler } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { CreateAuthorCommandHandlerImpl } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandlerImpl.js';
import { type CreateBookCommandHandler } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { CreateBookCommandHandlerImpl } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandlerImpl.js';
import { type DeleteAuthorCommandHandler } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler.js';
import { DeleteAuthorCommandHandlerImpl } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandlerImpl.js';
import { type DeleteBookCommandHandler } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { DeleteBookCommandHandlerImpl } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandlerImpl.js';
import { type FindAuthorQueryHandler } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler.js';
import { FindAuthorQueryHandlerImpl } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandlerImpl.js';
import { type FindBookQueryHandler } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { FindBookQueryHandlerImpl } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandlerImpl.js';
import { type AuthorRepository } from './domain/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from './domain/repositories/bookRepository/bookRepository.js';
import { type AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper.js';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl.js';
import { AuthorRepositoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryImpl.js';
import { type BookMapper } from './infrastructure/repositories/bookRepository/bookMapper/bookMapper.js';
import { BookMapperImpl } from './infrastructure/repositories/bookRepository/bookMapper/bookMapperImpl.js';
import { BookRepositoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryImpl.js';
import { symbols } from './symbols.js';
import { type SqliteDatabaseClient } from '../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';

export class BookModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<BookMapper>(symbols.bookMapper, () => new BookMapperImpl());

    container.bind<BookRepository>(
      symbols.bookRepository,
      () =>
        new BookRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<BookMapper>(symbols.bookMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<CreateBookCommandHandler>(
      symbols.createBookCommandHandler,
      () =>
        new CreateBookCommandHandlerImpl(
          container.get<BookRepository>(symbols.bookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteBookCommandHandler>(
      symbols.deleteBookCommandHandler,
      () =>
        new DeleteBookCommandHandlerImpl(
          container.get<BookRepository>(symbols.bookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<FindBookQueryHandler>(
      symbols.findBookQueryHandler,
      () => new FindBookQueryHandlerImpl(container.get<BookRepository>(symbols.bookRepository)),
    );

    container.bind<BookHttpController>(
      symbols.bookHttpController,
      () =>
        new BookHttpController(
          container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler),
          container.get<DeleteBookCommandHandler>(symbols.deleteBookCommandHandler),
          container.get<FindBookQueryHandler>(symbols.findBookQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<AuthorMapper>(symbols.authorMapper, () => new AuthorMapperImpl());

    container.bind<AuthorRepository>(
      symbols.authorRepository,
      () =>
        new AuthorRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<AuthorMapper>(symbols.authorMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<CreateAuthorCommandHandler>(
      symbols.createAuthorCommandHandler,
      () =>
        new CreateAuthorCommandHandlerImpl(
          container.get<AuthorRepository>(symbols.authorRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteAuthorCommandHandler>(
      symbols.deleteAuthorCommandHandler,
      () =>
        new DeleteAuthorCommandHandlerImpl(
          container.get<AuthorRepository>(symbols.authorRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<FindAuthorQueryHandler>(
      symbols.findAuthorQueryHandler,
      () => new FindAuthorQueryHandlerImpl(container.get<AuthorRepository>(symbols.authorRepository)),
    );

    container.bind<AuthorHttpController>(
      symbols.authorHttpController,
      () =>
        new AuthorHttpController(
          container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler),
          container.get<DeleteAuthorCommandHandler>(symbols.deleteAuthorCommandHandler),
          container.get<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
