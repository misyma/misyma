import { type VerifyUserEmailCommandHandler, type ExecutePayload } from './verifyUserEmailCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

// TODO: add tests
export class VerifyUserEmailCommandHandlerImpl implements VerifyUserEmailCommandHandler {
  public constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { userId, token } = payload;

    const user = await this.userRepository.findUser({
      id: userId,
    });

    if (!user) {
      this.loggerService.debug({
        message: 'User not found.',
        context: { userId },
      });

      return;
    }

    this.loggerService.debug({
      message: 'Verifying user email...',
      context: {
        userId: user.getId(),
        email: user.getEmail(),
      },
    });

    const tokenPayload = this.tokenService.verifyToken(token);

    const tokenPayloadUserId = tokenPayload['userId'];

    if (tokenPayloadUserId !== user.getId()) {
      throw new OperationNotValidError({
        reason: 'User ID from token does not match user ID from payload.',
        tokenPayloadUserId,
        userId: user.getId(),
      });
    }

    const userTokens = await this.userRepository.findUserTokens({
      userId: user.getId(),
    });

    if (!userTokens) {
      throw new OperationNotValidError({
        reason: 'User tokens not found.',
        userId: user.getId(),
      });
    }

    const emailVerificationToken = userTokens.getEmailVerificationToken();

    if (emailVerificationToken !== token) {
      throw new OperationNotValidError({
        reason: 'Email verification token is not valid.',
        token,
      });
    }

    user.addVerifyEmailAction();

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    this.loggerService.info({
      message: 'User email verified.',
      context: {
        userId: user.getId(),
        email: user.getEmail(),
      },
    });
  }
}
