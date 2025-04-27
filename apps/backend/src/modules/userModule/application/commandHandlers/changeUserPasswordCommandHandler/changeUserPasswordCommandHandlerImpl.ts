import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { tokenTypes } from '../../../../../common/types/tokenType.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type BlacklistTokenRepository } from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';
import { type PasswordValidationService } from '../../services/passwordValidationService/passwordValidationService.js';

import {
  type ChangeUserPasswordCommandHandler,
  type ChangeUserPasswordCommandHandlerPayload,
} from './changeUserPasswordCommandHandler.js';

export class ChangeUserPasswordCommandHandlerImpl implements ChangeUserPasswordCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly blacklistTokenRepository: BlacklistTokenRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly passwordValidationService: PasswordValidationService,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ChangeUserPasswordCommandHandlerPayload): Promise<void> {
    const { identifier, newPassword } = payload;

    this.loggerService.debug({
      message: 'Changing User password...',
      identifier,
    });

    const userId =
      'userId' in identifier
        ? identifier.userId
        : (await this.verifyResetPasswordToken({ resetPasswordToken: identifier.resetPasswordToken })).userId;

    const user = await this.userRepository.findUser({ id: userId });

    if (!user) {
      throw new OperationNotValidError({
        reason: 'User not found.',
        userId,
      });
    }

    this.passwordValidationService.validate({ password: newPassword });

    const hashedPassword = await this.hashService.hash({ plainData: newPassword });

    user.setPassword({ password: hashedPassword });

    await this.userRepository.saveUser({ user });

    if ('resetPasswordToken' in identifier) {
      const { expiresAt } = this.tokenService.decodeToken({
        token: identifier.resetPasswordToken,
      });

      await this.blacklistTokenRepository.createBlacklistToken({
        expiresAt: new Date(expiresAt),
        token: identifier.resetPasswordToken,
      });
    }

    this.loggerService.debug({
      message: 'User password changed.',
      userId,
    });
  }

  private async verifyResetPasswordToken({ resetPasswordToken }: { resetPasswordToken: string }): Promise<{
    userId: string;
  }> {
    let tokenPayload: Record<string, string>;

    try {
      tokenPayload = this.tokenService.verifyToken({ token: resetPasswordToken });
    } catch (error) {
      throw new OperationNotValidError({
        reason: 'Invalid reset password token.',
        token: resetPasswordToken,
      });
    }

    const isBlacklisted = await this.blacklistTokenRepository.findBlacklistToken({
      token: resetPasswordToken,
    });

    if (isBlacklisted) {
      throw new OperationNotValidError({
        reason: 'Reset password token is already used.',
        resetPasswordToken,
      });
    }

    const { userId, type } = tokenPayload;

    if (!userId || type !== tokenTypes.passwordReset) {
      throw new OperationNotValidError({
        reason: 'Invalid reset password token.',
        resetPasswordToken,
      });
    }

    return { userId };
  }
}
