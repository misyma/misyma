import { type ChangeUserPasswordCommandHandler, type ExecutePayload } from './changeUserPasswordCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';

export class ChangeUserPasswordCommandHandlerImpl implements ChangeUserPasswordCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { resetPasswordToken, newPassword, repeatedNewPassword, userId } = payload;

    this.tokenService.verifyToken({ token: resetPasswordToken });

    const userTokens = await this.userRepository.findUserTokens({
      userId,
    });

    if (!userTokens) {
      throw new OperationNotValidError({
        reason: 'User tokens not found.',
        userId,
      });
    }

    if (userTokens.getResetPasswordToken() !== resetPasswordToken) {
      throw new OperationNotValidError({
        reason: 'Reset password token is not valid.',
        resetPasswordToken,
      });
    }

    if (newPassword !== repeatedNewPassword) {
      throw new OperationNotValidError({
        reason: 'Passwords do not match.',
        newPassword,
        repeatedNewPassword,
      });
    }

    const user = await this.userRepository.findUser({
      id: userId,
    });

    if (!user) {
      throw new OperationNotValidError({
        reason: 'User not found.',
        userId,
      });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    user.addUpdatePasswordAction({
      newPassword: hashedPassword,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });
  }
}
