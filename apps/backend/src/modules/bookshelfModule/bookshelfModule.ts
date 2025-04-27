import { type Config } from '../../core/config.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';
import { type S3Service } from '../../libs/s3/s3Service.js';
import { type UuidService } from '../../libs/uuid/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';
import { type UserBookRepository } from '../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { bookSymbols } from '../bookModule/symbols.js';
import { databaseSymbols } from '../databaseModule/symbols.js';
import { type DatabaseClient } from '../databaseModule/types/databaseClient.js';
import { type UserRepository } from '../userModule/domain/repositories/userRepository/userRepository.js';
import { userSymbols } from '../userModule/symbols.js';

import { BookshelfHttpController } from './api/httpControllers/bookshelfHttpController/bookshelfHttpController.js';
import { type CreateBookshelfCommandHandler } from './application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandler.js';
import { CreateBookshelfCommandHandlerImpl } from './application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandlerImpl.js';
import { type DeleteBookshelfCommandHandler } from './application/commandHandlers/deleteBookshelfCommandHandler/deleteBookshelfCommandHandler.js';
import { DeleteBookshelfCommandHandlerImpl } from './application/commandHandlers/deleteBookshelfCommandHandler/deleteBookshelfCommandHandlerImpl.js';
import { type UpdateBookshelfCommandHandler } from './application/commandHandlers/updateBookshelfCommandHandler/updateBookshelfCommandHandler.js';
import { UpdateBookshelfCommandHandlerImpl } from './application/commandHandlers/updateBookshelfCommandHandler/updateBookshelfCommandHandlerImpl.js';
import { type UploadBookshelfImageCommandHandler } from './application/commandHandlers/uploadBookshelfImageCommandHandler/uploadBookshelfImageCommandHandler.js';
import { UploadBookshelfImageCommandHandlerImpl } from './application/commandHandlers/uploadBookshelfImageCommandHandler/uploadBookshelfImageCommandHandlerImpl.js';
import { type FindBookshelfByIdQueryHandler } from './application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { FindBookshelfByIdQueryHandlerImpl } from './application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandlerImpl.js';
import { type FindBookshelvesQueryHandler } from './application/queryHandlers/findBookshelvesQueryHandler/findBookshelvesQueryHandler.js';
import { FindBookshelvesQueryHandlerImpl } from './application/queryHandlers/findBookshelvesQueryHandler/findBookshelvesQueryHandlerImpl.js';
import { type BookshelfRepository } from './domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookshelfMapper } from './infrastructure/repositories/bookshelfRepository/bookshelfMapper/bookshelfMapper.js';
import { BookshelfMapperImpl } from './infrastructure/repositories/bookshelfRepository/bookshelfMapper/bookshelfMapperImpl.js';
import { BookshelfRepositoryImpl } from './infrastructure/repositories/bookshelfRepository/bookshelfRepositoryImpl.js';
import { symbols } from './symbols.js';

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
          container.get<FindBookshelvesQueryHandler>(symbols.findBookshelvesByUserIdQueryHandler),
          container.get<FindBookshelfByIdQueryHandler>(symbols.findBookshelfByIdQueryHandler),
          container.get<CreateBookshelfCommandHandler>(symbols.createBookshelfCommandHandler),
          container.get<UpdateBookshelfCommandHandler>(symbols.updateBookshelfCommandHandler),
          container.get<UploadBookshelfImageCommandHandler>(symbols.uploadBookshelfImageCommandHandler),
          container.get<DeleteBookshelfCommandHandler>(symbols.deleteBookshelfCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }

  private bindRepositories(container: DependencyInjectionContainer): void {
    container.bind<BookshelfRepository>(
      symbols.bookshelfRepository,
      () =>
        new BookshelfRepositoryImpl(
          container.get<DatabaseClient>(databaseSymbols.databaseClient),
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

    container.bind<FindBookshelvesQueryHandler>(
      symbols.findBookshelvesByUserIdQueryHandler,
      () =>
        new FindBookshelvesQueryHandlerImpl(
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

    container.bind<UpdateBookshelfCommandHandler>(
      symbols.updateBookshelfCommandHandler,
      () =>
        new UpdateBookshelfCommandHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UploadBookshelfImageCommandHandler>(
      symbols.uploadBookshelfImageCommandHandler,
      () =>
        new UploadBookshelfImageCommandHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<S3Service>(coreSymbols.s3Service),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<Config>(coreSymbols.config),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<DeleteBookshelfCommandHandler>(
      symbols.deleteBookshelfCommandHandler,
      () =>
        new DeleteBookshelfCommandHandlerImpl(
          container.get<BookshelfRepository>(symbols.bookshelfRepository),
          container.get<UserBookRepository>(bookSymbols.userBookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }
}
