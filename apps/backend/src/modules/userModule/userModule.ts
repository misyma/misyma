import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController.js';
import { type ChangeUserPasswordCommandHandler } from './application/commandHandlers/changeUserPasswordCommandHandler/changeUserPasswordCommandHandler.js';
import { ChangeUserPasswordCommandHandlerImpl } from './application/commandHandlers/changeUserPasswordCommandHandler/changeUserPasswordCommandHandlerImpl.js';
import { type DeleteUserCommandHandler } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { DeleteUserCommandHandlerImpl } from './application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandlerImpl.js';
import { type LoginUserCommandHandler } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { LoginUserCommandHandlerImpl } from './application/commandHandlers/loginUserCommandHandler/loginUserCommandHandlerImpl.js';
import { type RegisterUserCommandHandler } from './application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler.js';
import { RegisterUserCommandHandlerImpl } from './application/commandHandlers/registerUserCommandHandler/registerUserCommandHandlerImpl.js';
import { type ResetUserPasswordCommandHandler } from './application/commandHandlers/resetUserPasswordCommandHandler/resetUserPasswordCommandHandler.js';
import { ResetUserPasswordCommandHandlerImpl } from './application/commandHandlers/resetUserPasswordCommandHandler/resetUserPasswordCommandHandlerImpl.js';
import { type FindUserQueryHandler } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { FindUserQueryHandlerImpl } from './application/queryHandlers/findUserQueryHandler/findUserQueryHandlerImpl.js';
import { type EmailService } from './application/services/emailService/emailService.js';
import { type HashService } from './application/services/hashService/hashService.js';
import { HashServiceImpl } from './application/services/hashService/hashServiceImpl.js';
import { type UserRepository } from './domain/repositories/userRepository/userRepository.js';
import { type UserMapper } from './infrastructure/repositories/userRepository/userMapper/userMapper.js';
import { UserMapperImpl } from './infrastructure/repositories/userRepository/userMapper/userMapperImpl.js';
import { UserRepositoryImpl } from './infrastructure/repositories/userRepository/userRepositoryImpl.js';
import { type UserTokensMapper } from './infrastructure/repositories/userRepository/userTokensMapper/userTokensMapper.js';
import { UserTokensMapperImpl } from './infrastructure/repositories/userRepository/userTokensMapper/userTokensMapperImpl.js';
import { EmailServiceImpl } from './infrastructure/services/emailServiceImpl.js';
import { symbols } from './symbols.js';
import { type UserModuleConfigProvider } from './userModuleConfigProvider.js';
import { type ConfigProvider } from '../../core/configProvider.js';
import { type SqliteDatabaseClient } from '../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type SendGridService } from '../../libs/sendGrid/services/sendGridService/sendGridService.js';
import { type UuidService } from '../../libs/uuid/services/uuidService/uuidService.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { type TokenService } from '../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../authModule/symbols.js';

export class UserModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<UserModuleConfigProvider>(symbols.userModuleConfigProvider, () =>
      container.get<ConfigProvider>(coreSymbols.configProvider),
    );

    const configProvider = container.get<ConfigProvider>(coreSymbols.configProvider);

    container.bind<UserMapper>(symbols.userMapper, () => new UserMapperImpl());

    container.bind<UserTokensMapper>(symbols.userTokensMapper, () => new UserTokensMapperImpl());

    container.bind<UserRepository>(
      symbols.userRepository,
      () =>
        new UserRepositoryImpl(
          container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient),
          container.get<UserMapper>(symbols.userMapper),
          container.get<UserTokensMapper>(symbols.userTokensMapper),
          container.get<UuidService>(coreSymbols.uuidService),
        ),
    );

    container.bind<HashService>(
      symbols.hashService,
      () => new HashServiceImpl(container.get<UserModuleConfigProvider>(symbols.userModuleConfigProvider)),
    );

    container.bind<EmailService>(
      symbols.emailService,
      () =>
        new EmailServiceImpl(container.get<SendGridService>(coreSymbols.sendGridService), {
          confirmEmail: {
            link: configProvider.getConfirmEmailLink(),
          },
          resetPasswordEmail: {
            link: configProvider.getResetPasswordLink(),
          },
        }),
    );

    container.bind<RegisterUserCommandHandler>(
      symbols.registerUserCommandHandler,
      () =>
        new RegisterUserCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
          container.get<HashService>(symbols.hashService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<EmailService>(symbols.emailService),
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

    container.bind<ResetUserPasswordCommandHandler>(
      symbols.resetUserPasswordCommandHandler,
      () =>
        new ResetUserPasswordCommandHandlerImpl(
          container.get<EmailService>(symbols.emailService),
          container.get<TokenService>(authSymbols.tokenService),
          container.get<UserRepository>(symbols.userRepository),
        ),
    );

    container.bind<ChangeUserPasswordCommandHandler>(
      symbols.changeUserPasswordCommandHandler,
      () =>
        new ChangeUserPasswordCommandHandlerImpl(
          container.get<UserRepository>(symbols.userRepository),
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
