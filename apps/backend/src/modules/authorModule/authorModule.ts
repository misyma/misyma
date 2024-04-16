import { AuthorAdminHttpController } from './api/httpControllers/authorAdminHttpController/authorAdminHttpController.js';
import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController.js';
import { type CreateAuthorCommandHandler } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { CreateAuthorCommandHandlerImpl } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandlerImpl.js';
import { type DeleteAuthorCommandHandler } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler.js';
import { DeleteAuthorCommandHandlerImpl } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandlerImpl.js';
import { type FindAuthorQueryHandler } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler.js';
import { FindAuthorQueryHandlerImpl } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandlerImpl.js';
import { type FindAuthorsByIdsQueryHandler } from './application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandler.js';
import { FindAuthorsByIdsQueryHandlerImpl } from './application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandlerImpl.js';
import { type AuthorRepository } from './domain/repositories/authorRepository/authorRepository.js';
import { type AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper.js';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl.js';
import { AuthorRepositoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryImpl.js';
import { symbols } from './symbols.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DatabaseClient } from '../../libs/database/clients/databaseClient/databaseClient.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';

export class AuthorModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<AuthorMapper>(symbols.authorMapper, () => new AuthorMapperImpl());

    container.bind<AuthorRepository>(
      symbols.authorRepository,
      () =>
        new AuthorRepositoryImpl(
          container.get<DatabaseClient>(coreSymbols.databaseClient),
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

    container.bind<FindAuthorsByIdsQueryHandler>(
      symbols.findAuthorsByIdsQueryHandler,
      () => new FindAuthorsByIdsQueryHandlerImpl(container.get<AuthorRepository>(symbols.authorRepository)),
    );

    container.bind<AuthorHttpController>(
      symbols.authorHttpController,
      () =>
        new AuthorHttpController(
          container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler),
          container.get<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler),
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
  }
}
