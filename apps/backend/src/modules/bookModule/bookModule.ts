import { AuthorAdminHttpController } from './api/httpControllers/authorAdminHttpController/authorAdminHttpController.js';
import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController.js';
import { BookAdminHttpController } from './api/httpControllers/bookAdminHttpController/bookAdminHttpController.js';
import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController.js';
import { BookReadingHttpController } from './api/httpControllers/bookReadingHttpController/bookReadingHttpController.js';
import { GenreAdminHttpController } from './api/httpControllers/genreAdminHttpController/genreAdminHttpController.js';
import { GenreHttpController } from './api/httpControllers/genreHttpController/genreHttpController.js';
import { UserBookHttpController } from './api/httpControllers/userBookHttpController/userBookHttpController.js';
import { type CreateAuthorCommandHandler } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { CreateAuthorCommandHandlerImpl } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandlerImpl.js';
import { type CreateBookCommandHandler } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { CreateBookCommandHandlerImpl } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandlerImpl.js';
import { type CreateBookReadingCommandHandler } from './application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandler.js';
import { CreateBookReadingCommandHandlerImpl } from './application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandlerImpl.js';
import { type CreateGenreCommandHandler } from './application/commandHandlers/createGenreCommandHandler/createGenreCommandHandler.js';
import { CreateGenreCommandHandlerImpl } from './application/commandHandlers/createGenreCommandHandler/createGenreCommandHandlerImpl.js';
import { type CreateUserBookCommandHandler } from './application/commandHandlers/createUserBookCommandHandler/createUserBookCommandHandler.js';
import { CreateUserBookCommandHandlerImpl } from './application/commandHandlers/createUserBookCommandHandler/createUserBookCommandHandlerImpl.js';
import { type DeleteAuthorCommandHandler } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler.js';
import { DeleteAuthorCommandHandlerImpl } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandlerImpl.js';
import { type DeleteBookCommandHandler } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { DeleteBookCommandHandlerImpl } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandlerImpl.js';
import { type DeleteBookReadingCommandHandler } from './application/commandHandlers/deleteBookReadingCommandHandler/deleteBookReadingCommandHandler.js';
import { DeleteBookReadingCommandHandlerImpl } from './application/commandHandlers/deleteBookReadingCommandHandler/deleteBookReadingCommandHandlerImpl.js';
import { type DeleteGenreCommandHandler } from './application/commandHandlers/deleteGenreCommandHandler/deleteGenreCommandHandler.js';
import { DeleteGenreCommandHandlerImpl } from './application/commandHandlers/deleteGenreCommandHandler/deleteGenreCommandHandlerImpl.js';
import { type DeleteUserBookCommandHandler } from './application/commandHandlers/deleteUserBookCommandHandler/deleteUserBookCommandHandler.js';
import { DeleteUserBookCommandHandlerImpl } from './application/commandHandlers/deleteUserBookCommandHandler/deleteUserBookCommandHandlerImpl.js';
import { type UpdateBookCommandHandler } from './application/commandHandlers/updateBookCommandHandler/updateBookCommandHandler.js';
import { UpdateBookCommandHandlerImpl } from './application/commandHandlers/updateBookCommandHandler/updateBookCommandHandlerImpl.js';
import { type UpdateBookReadingCommandHandler } from './application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandler.js';
import { UpdateBookReadingCommandHandlerImpl } from './application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandlerImpl.js';
import { type UpdateGenreNameCommandHandler } from './application/commandHandlers/updateGenreNameCommandHandler/updateGenreNameCommandHandler.js';
import { UpdateGenreNameCommandHandlerImpl } from './application/commandHandlers/updateGenreNameCommandHandler/updateGenreNameCommandHandlerImpl.js';
import { type UpdateUserBookCommandHandler } from './application/commandHandlers/updateUserBookCommandHandler/updateUserBookCommandHandler.js';
import { UpdateUserBookCommandHandlerImpl } from './application/commandHandlers/updateUserBookCommandHandler/updateUserBookCommandHandlerImpl.js';
import { type UpdateUserBookGenresCommandHandler } from './application/commandHandlers/updateUserBookGenresCommandHandler/updateUserBookGenresCommandHandler.js';
import { UpdateBookGenresCommandHandlerImpl } from './application/commandHandlers/updateUserBookGenresCommandHandler/updateUserBookGenresCommandHandlerImpl.js';
import { type UploadUserBookImageCommandHandler } from './application/commandHandlers/uploadUserBookImageCommandHandler/uploadUserBookImageCommandHandler.js';
import { UploadUserBookImageCommandHandlerImpl } from './application/commandHandlers/uploadUserBookImageCommandHandler/uploadUserBookImageCommandHandlerImpl.js';
import { type FindAuthorQueryHandler } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler.js';
import { FindAuthorQueryHandlerImpl } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandlerImpl.js';
import { type FindAuthorsQueryHandler } from './application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandler.js';
import { FindAuthorsQueryHandlerImpl } from './application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandlerImpl.js';
import { type FindBookQueryHandler } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { FindBookQueryHandlerImpl } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandlerImpl.js';
import { type FindBookReadingByIdQueryHandler } from './application/queryHandlers/findBookReadingByIdQueryHandler/findBookReadingByIdQueryHandler.js';
import { FindBookReadingByIdQueryHandlerImpl } from './application/queryHandlers/findBookReadingByIdQueryHandler/findBookReadingByIdQueryHandlerImpl.js';
import { type FindBookReadingsByUserBookIdQueryHandler } from './application/queryHandlers/findBookReadingsByUserBookIdQueryHandler/findBookReadingsByUserBookIdQueryHandler.js';
import { FindBookReadingsByBookIdQueryHandlerImpl } from './application/queryHandlers/findBookReadingsByUserBookIdQueryHandler/findBookReadingsByUserBookIdQueryHandlerImpl.js';
import { type FindBooksQueryHandler } from './application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler.js';
import { FindBooksQueryHandlerImpl } from './application/queryHandlers/findBooksQueryHandler/findBooksQueryHandlerImpl.js';
import { type FindGenreByIdQueryHandler } from './application/queryHandlers/findGenreByIdQueryHandler/findGenreByIdQueryHandler.js';
import { FindGenreByIdQueryHandlerImpl } from './application/queryHandlers/findGenreByIdQueryHandler/findGenreByIdQueryHandlerImpl.js';
import { type FindGenreByNameQueryHandler } from './application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandler.js';
import { FindGenreByNameQueryHandlerImpl } from './application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandlerImpl.js';
import { type FindGenresQueryHandler } from './application/queryHandlers/findGenresQueryHandler/findGenresQueryHandler.js';
import { FindGenresQueryHandlerImpl } from './application/queryHandlers/findGenresQueryHandler/findGenresQueryHandlerImpl.js';
import { type FindUserBookQueryHandler } from './application/queryHandlers/findUserBookQueryHandler/findUserBookQueryHandler.js';
import { FindUserBookQueryHandlerImpl } from './application/queryHandlers/findUserBookQueryHandler/findUserBookQueryHandlerImpl.js';
import { type FindUserBooksQueryHandler } from './application/queryHandlers/findUserBooksQueryHandler/findUserBooksQueryHandler.js';
import { FindUserBooksQueryHandlerImpl } from './application/queryHandlers/findUserBooksQueryHandler/findUserBooksQueryHandlerImpl.js';
import { type AuthorRepository } from './domain/repositories/authorRepository/authorRepository.js';
import { type BookReadingRepository } from './domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type BookRepository } from './domain/repositories/bookRepository/bookRepository.js';
import { type GenreRepository } from './domain/repositories/genreRepository/genreRepository.js';
import { type QuoteRepository } from './domain/repositories/quoteRepository/quoteRepository.js';
import { type UserBookRepository } from './domain/repositories/userBookRepository/userBookRepository.js';
import { type AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper.js';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl.js';
import { AuthorRepositoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryImpl.js';
import { type BookReadingMapper } from './infrastructure/repositories/bookReadingRepository/bookReadingMapper/bookReadingMapper.js';
import { BookReadingMapperImpl } from './infrastructure/repositories/bookReadingRepository/bookReadingMapper/bookReadingMapperImpl.js';
import { BookReadingRepositoryImpl } from './infrastructure/repositories/bookReadingRepository/bookReadingRepositoryImpl.js';
import { type BookMapper } from './infrastructure/repositories/bookRepository/bookMapper/bookMapper.js';
import { BookMapperImpl } from './infrastructure/repositories/bookRepository/bookMapper/bookMapperImpl.js';
import { BookRepositoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryImpl.js';
import { type GenreMapper } from './infrastructure/repositories/genreRepository/genreMapper/genreMapper.js';
import { GenreMapperImpl } from './infrastructure/repositories/genreRepository/genreMapper/genreMapperImpl.js';
import { GenreRepositoryImpl } from './infrastructure/repositories/genreRepository/genreRepositoryImpl.js';
import { type QuoteMapper } from './infrastructure/repositories/quoteRepository/quoteMapper/quoteMapper.js';
import { QuoteMapperImpl } from './infrastructure/repositories/quoteRepository/quoteMapper/quoteMapperImpl.js';
import { QuoteRepositoryImpl } from './infrastructure/repositories/quoteRepository/quoteRepositoryImpl.js';
import { type UserBookMapper } from './infrastructure/repositories/userBookRepository/userBookMapper/userBookMapper.js';
import { UserBookMapperImpl } from './infrastructure/repositories/userBookRepository/userBookMapper/userBookMapperImpl.js';
import { UserBookRepositoryImpl } from './infrastructure/repositories/userBookRepository/userBookRepositoryImpl.js';
import { bookSymbols, symbols } from './symbols.js';
import { type Config } from '../../core/config.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DatabaseClient } from '../../libs/database/clients/databaseClient/databaseClient.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../libs/s3/services/s3Service/s3Service.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';
import { type BookshelfRepository } from '../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { bookshelfSymbols } from '../bookshelfModule/symbols.js';

export class BookModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    this.bindMappers(container);

    this.bindRepositories(container);

    this.bindCommandHandlers(container);

    this.bindQueryHandlers(container);

    this.bindHttpControllers(container);
  }

  private bindMappers(container: DependencyInjectionContainer): void {
    container.bind<BookMapper>(symbols.bookMapper, () => new BookMapperImpl());

    container.bind<UserBookMapper>(symbols.userBookMapper, () => new UserBookMapperImpl());

    container.bind<GenreMapper>(symbols.genreMapper, () => new GenreMapperImpl());

    container.bind<AuthorMapper>(symbols.authorMapper, () => new AuthorMapperImpl());

    container.bind<BookReadingMapper>(symbols.bookReadingMapper, () => new BookReadingMapperImpl());

    container.bind<QuoteMapper>(symbols.quoteMapper, () => new QuoteMapperImpl());
  }

  private bindRepositories(container: DependencyInjectionContainer): void {
    container.bind<BookRepository>(
      symbols.bookRepository,
      () =>
        new BookRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<BookMapper>(symbols.bookMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<GenreRepository>(
      symbols.genreRepository,
      () =>
        new GenreRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<GenreMapper>(symbols.genreMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<UserBookRepository>(
      symbols.userBookRepository,
      () =>
        new UserBookRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<UserBookMapper>(symbols.userBookMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<AuthorRepository>(
      symbols.authorRepository,
      () =>
        new AuthorRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<AuthorMapper>(symbols.authorMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<BookReadingRepository>(
      symbols.bookReadingRepository,
      () =>
        new BookReadingRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<BookReadingMapper>(symbols.bookReadingMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<QuoteRepository>(
      symbols.bookReadingRepository,
      () =>
        new QuoteRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
          container.get<QuoteMapper>(symbols.quoteMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );
  }

  private bindCommandHandlers(container: DependencyInjectionContainer): void {
    container.bind<CreateBookCommandHandler>(
      symbols.createBookCommandHandler,
      () =>
        new CreateBookCommandHandlerImpl(
          container.get<BookRepository>(symbols.bookRepository),
          container.get<AuthorRepository>(symbols.authorRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UpdateUserBookGenresCommandHandler>(
      symbols.updateUserBookGenresCommandHandler,
      () =>
        new UpdateBookGenresCommandHandlerImpl(
          container.get<UserBookRepository>(symbols.userBookRepository),
          container.get<GenreRepository>(symbols.genreRepository),
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

    container.bind<UpdateBookCommandHandler>(
      symbols.updateBookCommandHandler,
      () =>
        new UpdateBookCommandHandlerImpl(
          container.get<BookRepository>(symbols.bookRepository),
          container.get<AuthorRepository>(symbols.authorRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<CreateGenreCommandHandler>(
      symbols.createGenreCommandHandler,
      () =>
        new CreateGenreCommandHandlerImpl(
          container.get<GenreRepository>(symbols.genreRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteGenreCommandHandler>(
      symbols.deleteGenreCommandHandler,
      () =>
        new DeleteGenreCommandHandlerImpl(
          container.get<GenreRepository>(symbols.genreRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UpdateGenreNameCommandHandler>(
      symbols.updateGenreNameCommandHandler,
      () =>
        new UpdateGenreNameCommandHandlerImpl(
          container.get<GenreRepository>(symbols.genreRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<CreateUserBookCommandHandler>(
      symbols.createUserBookCommandHandler,
      () =>
        new CreateUserBookCommandHandlerImpl(
          container.get<BookRepository>(symbols.bookRepository),
          container.get<BookshelfRepository>(bookshelfSymbols.bookshelfRepository),
          container.get<UserBookRepository>(symbols.userBookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<GenreRepository>(symbols.genreRepository),
        ),
    );

    container.bind<UpdateUserBookCommandHandler>(
      symbols.updateUserBookCommandHandler,
      () =>
        new UpdateUserBookCommandHandlerImpl(
          container.get<UserBookRepository>(symbols.userBookRepository),
          container.get<BookshelfRepository>(bookshelfSymbols.bookshelfRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteUserBookCommandHandler>(
      symbols.deleteUserBookCommandHandler,
      () =>
        new DeleteUserBookCommandHandlerImpl(
          container.get<UserBookRepository>(symbols.userBookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UploadUserBookImageCommandHandler>(
      symbols.uploadUserBookImageCommandHandler,
      () =>
        new UploadUserBookImageCommandHandlerImpl(
          container.get<UserBookRepository>(symbols.userBookRepository),
          container.get<S3Service>(coreSymbols.s3Service),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<Config>(coreSymbols.config),
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

    container.bind<CreateBookReadingCommandHandler>(
      symbols.createBookReadingCommandHandler,
      () =>
        new CreateBookReadingCommandHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<UserBookRepository>(bookSymbols.userBookRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<UpdateBookReadingCommandHandler>(
      symbols.updateBookReadingCommandHandler,
      () =>
        new UpdateBookReadingCommandHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteBookReadingCommandHandler>(
      symbols.deleteBookReadingCommandHandler,
      () =>
        new DeleteBookReadingCommandHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }

  private bindQueryHandlers(container: DependencyInjectionContainer): void {
    container.bind<FindBookQueryHandler>(
      symbols.findBookQueryHandler,
      () => new FindBookQueryHandlerImpl(container.get<BookRepository>(symbols.bookRepository)),
    );

    container.bind<FindBooksQueryHandler>(
      symbols.findBooksQueryHandler,
      () => new FindBooksQueryHandlerImpl(container.get<BookRepository>(symbols.bookRepository)),
    );

    container.bind<FindGenreByNameQueryHandler>(
      symbols.findGenreByNameQueryHandler,
      () => new FindGenreByNameQueryHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );

    container.bind<FindGenresQueryHandler>(
      symbols.findGenresQueryHandler,
      () => new FindGenresQueryHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );

    container.bind<FindGenreByIdQueryHandler>(
      symbols.findGenreByIdQueryHandler,
      () => new FindGenreByIdQueryHandlerImpl(container.get<GenreRepository>(symbols.genreRepository)),
    );

    container.bind<FindUserBookQueryHandler>(
      symbols.findUserBookQueryHandler,
      () => new FindUserBookQueryHandlerImpl(container.get<UserBookRepository>(symbols.userBookRepository)),
    );

    container.bind<FindUserBooksQueryHandler>(
      symbols.findUserBooksQueryHandler,
      () =>
        new FindUserBooksQueryHandlerImpl(
          container.get<UserBookRepository>(symbols.userBookRepository),
          container.get<BookshelfRepository>(bookshelfSymbols.bookshelfRepository),
        ),
    );

    container.bind<FindAuthorQueryHandler>(
      symbols.findAuthorQueryHandler,
      () => new FindAuthorQueryHandlerImpl(container.get<AuthorRepository>(symbols.authorRepository)),
    );

    container.bind<FindAuthorsQueryHandler>(
      symbols.findAuthorsQueryHandler,
      () => new FindAuthorsQueryHandlerImpl(container.get<AuthorRepository>(symbols.authorRepository)),
    );

    container.bind<FindBookReadingByIdQueryHandler>(
      symbols.findBookReadingByIdQueryHandler,
      () =>
        new FindBookReadingByIdQueryHandlerImpl(container.get<BookReadingRepository>(symbols.bookReadingRepository)),
    );

    container.bind<FindBookReadingsByUserBookIdQueryHandler>(
      symbols.findBookReadingsByUserBookIdQueryHandler,
      () =>
        new FindBookReadingsByBookIdQueryHandlerImpl(
          container.get<BookReadingRepository>(symbols.bookReadingRepository),
          container.get<UserBookRepository>(bookSymbols.userBookRepository),
        ),
    );
  }

  private bindHttpControllers(container: DependencyInjectionContainer): void {
    container.bind<BookHttpController>(
      symbols.bookHttpController,
      () =>
        new BookHttpController(
          container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler),
          container.get<FindBookQueryHandler>(symbols.findBookQueryHandler),
          container.get<FindBooksQueryHandler>(symbols.findBooksQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<BookAdminHttpController>(
      symbols.bookAdminHttpController,
      () =>
        new BookAdminHttpController(
          container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler),
          container.get<DeleteBookCommandHandler>(symbols.deleteBookCommandHandler),
          container.get<UpdateBookCommandHandler>(symbols.updateBookCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<GenreHttpController>(
      symbols.genreHttpController,
      () =>
        new GenreHttpController(
          container.get<FindGenresQueryHandler>(symbols.findGenresQueryHandler),
          container.get<FindGenreByNameQueryHandler>(symbols.findGenreByNameQueryHandler),
          container.get<FindGenreByIdQueryHandlerImpl>(symbols.findGenreByIdQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<GenreAdminHttpController>(
      symbols.genreAdminHttpController,
      () =>
        new GenreAdminHttpController(
          container.get<CreateGenreCommandHandler>(symbols.createGenreCommandHandler),
          container.get<UpdateGenreNameCommandHandler>(symbols.updateGenreNameCommandHandler),
          container.get<DeleteGenreCommandHandler>(symbols.deleteGenreCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<UserBookHttpController>(
      symbols.userBookHttpController,
      () =>
        new UserBookHttpController(
          container.get<CreateUserBookCommandHandler>(symbols.createUserBookCommandHandler),
          container.get<UpdateUserBookCommandHandler>(symbols.updateUserBookCommandHandler),
          container.get<DeleteUserBookCommandHandler>(symbols.deleteUserBookCommandHandler),
          container.get<FindUserBookQueryHandler>(symbols.findUserBookQueryHandler),
          container.get<FindUserBooksQueryHandler>(symbols.findUserBooksQueryHandler),
          container.get<UpdateUserBookGenresCommandHandler>(symbols.updateUserBookGenresCommandHandler),
          container.get<UploadUserBookImageCommandHandler>(symbols.uploadUserBookImageCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<AuthorHttpController>(
      symbols.authorHttpController,
      () =>
        new AuthorHttpController(
          container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler),
          container.get<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler),
          container.get<FindAuthorsQueryHandler>(symbols.findAuthorsQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<AuthorAdminHttpController>(
      symbols.authorAdminHttpController,
      () =>
        new AuthorAdminHttpController(
          container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler),
          container.get<DeleteAuthorCommandHandler>(symbols.deleteAuthorCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<BookReadingHttpController>(
      symbols.bookReadingHttpController,
      () =>
        new BookReadingHttpController(
          container.get<FindBookReadingsByUserBookIdQueryHandler>(symbols.findBookReadingsByUserBookIdQueryHandler),
          container.get<FindBookReadingByIdQueryHandler>(symbols.findBookReadingByIdQueryHandler),
          container.get<CreateBookReadingCommandHandler>(symbols.createBookReadingCommandHandler),
          container.get<UpdateBookReadingCommandHandler>(symbols.updateBookReadingCommandHandler),
          container.get<DeleteBookReadingCommandHandler>(symbols.deleteBookReadingCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
