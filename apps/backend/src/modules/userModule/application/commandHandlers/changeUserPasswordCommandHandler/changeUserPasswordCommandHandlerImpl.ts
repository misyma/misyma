import { type ChangeUserPasswordCommandHandler, type ExecutePayload } from './changeUserPasswordCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type BlacklistTokenRepository } from '../../../domain/repositories/blacklistTokenRepository/blacklistTokenRepository.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';
import { type PasswordValidationService } from '../../services/passwordValidationService/passwordValidationService.js';

export class ChangeUserPasswordCommandHandlerImpl implements ChangeUserPasswordCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly blacklistTokenRepository: BlacklistTokenRepository,
    private readonly passwordValidationService: PasswordValidationService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { resetPasswordToken, newPassword, repeatedNewPassword, userId } = payload;

    const isTokenBlacklisted = await this.blacklistTokenRepository.findBlacklistToken({
      token: resetPasswordToken,
    });

    if (isTokenBlacklisted) {
      throw new OperationNotValidError({
        reason: 'Reset password token is blacklisted.',
        resetPasswordToken,
      });
    }

    this.tokenService.verifyToken({ token: resetPasswordToken });

    const user = await this.userRepository.findUser({
      id: userId,
    });

    if (!user) {
      throw new OperationNotValidError({
        reason: 'User not found.',
        userId,
      });
    }

    const userTokens = await this.userRepository.findUserTokens({
      userId,
    });

    if (!userTokens) {
      throw new OperationNotValidError({
        reason: 'User tokens not found.',
        userId,
      });
    }

    if (resetPasswordToken !== userTokens.resetPasswordToken) {
      throw new OperationNotValidError({
        reason: 'Reset password token is not valid.',
        resetPasswordToken,
      });
    }

    if (newPassword !== repeatedNewPassword) {
      throw new OperationNotValidError({
        reason: 'Passwords do not match.',
      });
    }

    this.passwordValidationService.validate({ password: newPassword });

    const hashedPassword = await this.hashService.hash({ plainData: newPassword });

    user.addUpdatePasswordAction({
      newPassword: hashedPassword,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    const { expiresAt } = this.tokenService.decodeToken({
      token: resetPasswordToken,
    });

    await this.blacklistTokenRepository.createBlacklistToken({
      token: resetPasswordToken,
      expiresAt: new Date(expiresAt),
    });
  }
}
