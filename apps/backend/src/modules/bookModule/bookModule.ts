import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController.js';
import { GenreHttpController } from './api/httpControllers/genreHttpController/genreHttpController.js';
import { type CreateBookCommandHandler } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { CreateBookCommandHandlerImpl } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandlerImpl.js';
import { type CreateGenreCommandHandler } from './application/commandHandlers/createGenreCommandHandler/createGenreCommandHandler.js';
import { CreateGenreCommandHandlerImpl } from './application/commandHandlers/createGenreCommandHandler/createGenreCommandHandlerImpl.js';
import { type DeleteBookCommandHandler } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { DeleteBookCommandHandlerImpl } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandlerImpl.js';
import { type UpdateGenreNameCommandHandler } from './application/commandHandlers/updateGenreNameCommandHandler/updateGenreNameCommandHandler.js';
import { UpdateGenreNameCommandHandlerImpl } from './application/commandHandlers/updateGenreNameCommandHandler/updateGenreNameCommandHandlerImpl.js';
import { type FindBookQueryHandler } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { FindBookQueryHandlerImpl } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandlerImpl.js';
import { type FindGenreByNameQueryHandler } from './application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandler.js';
import { FindGenreByNameQueryHandlerImpl } from './application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandlerImpl.js';
import { type FindGenresQueryHandler } from './application/queryHandlers/findGenresQueryHandler/findGenresQueryHandler.js';
import { FindGenresQueryHandlerImpl } from './application/queryHandlers/findGenresQueryHandler/findGenresQueryHandlerImpl.js';
import { type BookRepository } from './domain/repositories/bookRepository/bookRepository.js';
import { type GenreRepository } from './domain/repositories/genreRepository/genreRepository.js';
import { type BookMapper } from './infrastructure/repositories/bookRepository/bookMapper/bookMapper.js';
import { BookMapperImpl } from './infrastructure/repositories/bookRepository/bookMapper/bookMapperImpl.js';
import { BookRepositoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryImpl.js';
import { type GenreMapper } from './infrastructure/repositories/genreRepository/genreMapper/genreMapper.js';
import { GenreMapperImpl } from './infrastructure/repositories/genreRepository/genreMapper/genreMapperImpl.js';
import { GenreRepositoryImpl } from './infrastructure/repositories/genreRepository/genreRepositoryImpl.js';
import { symbols } from './symbols.js';
import { type SqliteDatabaseClient } from '../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';
import { type FindAuthorsByIdsQueryHandler } from '../authorModule/application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandler.js';
import { authorSymbols } from '../authorModule/symbols.js';
import { type BookshelfRepository } from '../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { bookshelfSymbols } from '../bookshelfModule/symbols.js';

export class BookModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<BookMapper>(symbols.bookMapper, () => new BookMapperImpl());

    container.bind<GenreMapper>(symbols.genreMapper, () => new GenreMapperImpl());

    this.bindRepositories(container);

    this.bindCommandHandlers(container);

    this.bindQueryHandlers(container);

    this.bindHttpControllers(container);
  }

  private bindRepositories(container: DependencyInjectionContainer): void {
    container.bind<BookRepository>(
      symbols.bookRepository,
      () =>
        new BookRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<BookMapper>(symbols.bookMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<GenreRepository>(
      symbols.genreRepository,
      () =>
        new GenreRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<GenreMapper>(symbols.genreMapper),
          container.get<UuidService>(coreSymbols.uuidService),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }

  private bindCommandHandlers(container: DependencyInjectionContainer): void {
    container.bind<CreateBookCommandHandler>(
      symbols.createBookCommandHandler,
      () =>
        new CreateBookCommandHandlerImpl(
          container.get<BookRepository>(symbols.bookRepository),
          container.get<FindAuthorsByIdsQueryHandler>(authorSymbols.findAuthorsByIdsQueryHandler),
          container.get<BookshelfRepository>(bookshelfSymbols.bookshelfRepository),
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

    container.bind<CreateGenreCommandHandler>(
      symbols.createGenreCommandHandler,
      () => new CreateGenreCommandHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );

    container.bind<UpdateGenreNameCommandHandler>(
      symbols.updateGenreNameCommandHandler,
      () => new UpdateGenreNameCommandHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );
  }

  private bindQueryHandlers(container: DependencyInjectionContainer): void {
    container.bind<FindBookQueryHandler>(
      symbols.findBookQueryHandler,
      () => new FindBookQueryHandlerImpl(container.get<BookRepository>(symbols.bookRepository)),
    );

    container.bind<FindGenreByNameQueryHandler>(
      symbols.findGenreByNameQueryHandler,
      () => new FindGenreByNameQueryHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );

    container.bind<FindGenresQueryHandler>(
      symbols.findGenresQueryHandler,
      () => new FindGenresQueryHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );
  }

  private bindHttpControllers(container: DependencyInjectionContainer): void {
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

    container.bind<GenreHttpController>(
      symbols.genreHttpController,
      () =>
        new GenreHttpController(
          container.get<FindGenresQueryHandler>(symbols.findGenresQueryHandler),
          container.get<FindGenreByNameQueryHandler>(symbols.findGenreByNameQueryHandler),
          container.get<CreateGenreCommandHandler>(symbols.createGenreCommandHandler),
          container.get<UpdateGenreNameCommandHandler>(symbols.updateGenreNameCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
