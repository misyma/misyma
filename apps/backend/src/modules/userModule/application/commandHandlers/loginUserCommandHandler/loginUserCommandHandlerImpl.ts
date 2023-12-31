import {
  type LoginUserCommandHandler,
  type LoginUserCommandHandlerPayload,
  type LoginUserCommandHandlerResult,
} from './loginUserCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type HashService } from '../../services/hashService/hashService.js';

export class LoginUserCommandHandlerImpl implements LoginUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly configProvider: UserModuleConfigProvider,
  ) {}

  public async execute(payload: LoginUserCommandHandlerPayload): Promise<LoginUserCommandHandlerResult> {
    const { email, password } = payload;

    this.loggerService.debug({
      message: 'Logging User in...',
      context: { email },
    });

    const user = await this.userRepository.findUser({ email });

    if (!user) {
      throw new ResourceNotFoundError({
        name: 'User',
        email,
      });
    }

    if (!user.getIsEmailVerified()) {
      throw new OperationNotValidError({
        reason: 'User email is not verified.',
        email,
      });
    }

    const passwordIsValid = await this.hashService.compare({
      plainData: password,
      hashedData: user.getPassword(),
    });

    if (!passwordIsValid) {
      throw new ResourceNotFoundError({
        name: 'User',
        email,
      });
    }

    const accessTokenExpiresIn = this.configProvider.getAccessTokenExpiresIn();

    const accessToken = this.tokenService.createToken({
      data: { userId: user.getId() },
      expiresIn: accessTokenExpiresIn,
    });

    const refreshTokenExpiresIn = this.configProvider.getRefreshTokenExpiresIn();

    const refreshToken = this.tokenService.createToken({
      data: { userId: user.getId() },
      expiresIn: refreshTokenExpiresIn,
    });

    user.addUpdateRefreshTokenAction({
      refreshToken,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    this.loggerService.info({
      message: 'User logged in.',
      context: {
        email,
        userId: user.getId(),
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
    };
  }
}
