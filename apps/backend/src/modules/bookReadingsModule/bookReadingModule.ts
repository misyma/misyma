import { BookReadingHttpController } from './api/httpControllers/bookReadingHttpController/bookReadingHttpController.js';
import { type CreateBookReadingCommandHandler } from './application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandler.js';
import { CreateBookReadingCommandHandlerImpl } from './application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandlerImpl.js';
import { type DeleteBookReadingCommandHandler } from './application/commandHandlers/deleteBookReadingCommandHandler/deleteBookReadingCommandHandler.js';
import { DeleteBookReadingCommandHandlerImpl } from './application/commandHandlers/deleteBookReadingCommandHandler/deleteBookReadingCommandHandlerImpl.js';
import { type UpdateBookReadingCommandHandler } from './application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandler.js';
import { UpdateBookReadingCommandHandlerImpl } from './application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandlerImpl.js';
import { type FindBookReadingByIdQueryHandler } from './application/queryHandlers/findBookReadingByIdQueryHandler/findBookReadingByIdQueryHandler.js';
import { FindBookReadingByIdQueryHandlerImpl } from './application/queryHandlers/findBookReadingByIdQueryHandler/findBookReadingByIdQueryHandlerImpl.js';
import { type FindBookReadingsByBookIdQueryHandler } from './application/queryHandlers/findBookReadingsByBookIdQueryHandler/findBookReadingsByBookIdQueryHandler.js';
import { FindBookReadingsByBookIdQueryHandlerImpl } from './application/queryHandlers/findBookReadingsByBookIdQueryHandler/findBookReadingsByBookIdQueryHandlerImpl.js';
import { type BookReadingRepository } from './domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { BookReadingRepositoryImpl } from './infrastructure/repositories/bookReadingRepository/bookReadingRepositoryImpl.js';
import { type BookReadingMapper } from './infrastructure/repositories/mappers/bookReadingMapper/bookReadingMapper.js';
import { BookReadingMapperImpl } from './infrastructure/repositories/mappers/bookReadingMapper/bookReadingMapperImpl.js';
import { symbols } from './symbols.js';
import { type SqliteDatabaseClient } from '../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';
import { type BookRepository } from '../bookModule/domain/repositories/bookRepository/bookRepository.js';
import { bookSymbols } from '../bookModule/symbols.js';

export class BookReadingModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<BookReadingMapper>(symbols.bookReadingMapper, () => new BookReadingMapperImpl());

    this.bindRepositories(container);

    this.bindQueryHandlers(container);

    this.bindCommandHandlers(container);

    container.bind<BookReadingHttpController>(
      symbols.bookReadingHttpController,
      () =>
        new BookReadingHttpController(
          container.get<FindBookReadingsByBookIdQueryHandler>(symbols.findBookReadingsByBookIdQueryHandler),
          container.get<FindBookReadingByIdQueryHandler>(symbols.findBookReadingByIdQueryHandler),
          container.get<CreateBookReadingCommandHandler>(symbols.createBookReadingCommandHandler),
          container.get<UpdateBookReadingCommandHandler>(symbols.updateBookReadingNameCommandHandler),
          container.get<DeleteBookReadingCommandHandler>(symbols.deleteBookReadingNameCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }

  private bindRepositories(container: DependencyInjectionContainer): void {
    container.bind<BookReadingRepository>(
      symbols.bookReadingRepository,
      () =>
        new BookReadingRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<BookReadingMapper>(symbols.bookReadingMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );
  }

  private bindQueryHandlers(container: DependencyInjectionContainer): void {
    container.bind<FindBookReadingByIdQueryHandler>(
      symbols.findBookReadingByIdQueryHandler,
      () =>
        new FindBookReadingByIdQueryHandlerImpl(container.get<BookReadingRepository>(symbols.bookReadingRepository)),
    );

    container.bind<FindBookReadingsByBookIdQueryHandler>(
      symbols.findBookReadingsByBookIdQueryHandler,
      () =>
        new FindBookReadingsByBookIdQueryHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<BookRepository>(bookSymbols.bookRepository),
        ),
    );
  }

  private bindCommandHandlers(container: DependencyInjectionContainer): void {
    container.bind<CreateBookReadingCommandHandler>(
      symbols.createBookReadingCommandHandler,
      () =>
        new CreateBookReadingCommandHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<BookRepository>(bookSymbols.bookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UpdateBookReadingCommandHandler>(
      symbols.updateBookReadingNameCommandHandler,
      () =>
        new UpdateBookReadingCommandHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteBookReadingCommandHandler>(
      symbols.deleteBookReadingNameCommandHandler,
      () =>
        new DeleteBookReadingCommandHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }
}
