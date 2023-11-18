import {
  type LoginUserCommandHandler,
  type LoginUserCommandHandlerPayload,
  type LoginUserCommandHandlerResult,
} from './loginUserCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';

export class LoginUserCommandHandlerImpl implements LoginUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  public async execute(payload: LoginUserCommandHandlerPayload): Promise<LoginUserCommandHandlerResult> {
    const { email, password } = payload;

    this.loggerService.debug({
      message: 'Logging user in...',
      context: { email },
    });

    const user = await this.userRepository.findUser({ email });

    if (!user) {
      throw new ResourceNotFoundError({
        name: 'user',
        email,
      });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new ResourceNotFoundError({
        name: 'user',
        email,
      });
    }

    const accessToken = this.tokenService.createToken({ userId: user.id });

    this.loggerService.info({
      message: 'User logged in.',
      context: {
        email,
        userId: user.id,
        accessToken,
      },
    });

    return { accessToken };
  }
}
