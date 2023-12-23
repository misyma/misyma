import { type ExecutePayload, type ResetUserPasswordCommandHandler } from './resetUserPasswordCommandHandler.js';
import { EmailType } from '../../../../../common/types/emailType.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type EmailService } from '../../services/emailService/emailService.js';

export class ResetUserPasswordCommandHandlerImpl implements ResetUserPasswordCommandHandler {
  public constructor(
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { email } = payload;

    const user = await this.userRepository.findUser({
      email,
    });

    if (!user) {
      return;
    }

    const resetPasswordToken = this.tokenService.createToken({
      userId: user.getId(),
    });

    user.addResetPasswordAction({
      resetPasswordToken,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    await this.emailService.sendEmail({
      emailType: EmailType.resetPassword,
      user: {
        email,
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
      },
    });
  }
}
