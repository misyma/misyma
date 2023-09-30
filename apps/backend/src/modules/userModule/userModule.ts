import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController.js';
import { type DeleteUserCommandHandler } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { DeleteUserCommandHandlerImpl } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandlerImpl.js';
import { type LoginUserCommandHandler } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { LoginUserCommandHandlerImpl } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandlerImpl.js';
import { type RegisterUserCommandHandler } from './application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler.js';
import { RegisterUserCommandHandlerImpl } from './application/commandHandlers/registerUserCommandHandler/registerUserCommandHandlerImpl.js';
import { type FindUserQueryHandler } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { FindUserQueryHandlerImpl } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandlerImpl.js';
import { type UserRepository } from './application/repositories/userRepository/userRepository.js';
import { type HashService } from './application/services/hashService/hashService.js';
import { HashServiceImpl } from './application/services/hashService/hashServiceImpl.js';
import { type UserMapper } from './infrastructure/repositories/userRepository/userMapper/userMapper.js';
import { UserMapperImpl } from './infrastructure/repositories/userRepository/userMapper/userMapperImpl.js';
import { UserRepositoryImpl } from './infrastructure/repositories/userRepository/userRepositoryImpl.js';
import { symbols } from './symbols.js';
import { type UserModuleConfig } from './userModuleConfig.js';
import { type PostgresDatabaseClient } from '../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { type TokenService } from '../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../authModule/symbols.js';

export class UserModule implements DependencyInjectionModule {
  public constructor(private readonly config: UserModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<UserModuleConfig>(symbols.userModuleConfig, this.config);

    container.bind<UserMapper>(symbols.userMapper, () => new UserMapperImpl());

    container.bind<UserRepository>(
      symbols.userRepository,
      () =>
        new UserRepositoryImpl(
          container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient),
          container.get<UserMapper>(symbols.userMapper),
        ),
    );

    container.bind<HashService>(
      symbols.hashService,
      () => new HashServiceImpl(container.get<UserModuleConfig>(symbols.userModuleConfig)),
    );

    container.bind<RegisterUserCommandHandler>(
      symbols.registerUserCommandHandler,
      () =>
        new RegisterUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<HashService>(symbols.hashService),
          container.get<UuidService>(coreSymbols.uuidService),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<LoginUserCommandHandler>(
      symbols.loginUserCommandHandler,
      () =>
        new LoginUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<HashService>(symbols.hashService),
          container.get<TokenService>(authSymbols.tokenService),
        ),
    );

    container.bind<DeleteUserCommandHandler>(
      symbols.deleteUserCommandHandler,
      () =>
        new DeleteUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<FindUserQueryHandler>(
      symbols.findUserQueryHandler,
      () => new FindUserQueryHandlerImpl(container.get<UserRepository>(symbols.userRepository)),
    );

    container.bind<UserHttpController>(
      symbols.userHttpController,
      () =>
        new UserHttpController(
          container.get<RegisterUserCommandHandler>(symbols.registerUserCommandHandler),
          container.get<LoginUserCommandHandler>(symbols.loginUserCommandHandler),
          container.get<DeleteUserCommandHandler>(symbols.deleteUserCommandHandler),
          container.get<FindUserQueryHandler>(symbols.findUserQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
