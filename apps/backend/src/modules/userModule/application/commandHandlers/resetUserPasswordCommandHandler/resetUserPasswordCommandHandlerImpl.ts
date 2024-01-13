import { type ExecutePayload, type ResetUserPasswordCommandHandler } from './resetUserPasswordCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type EmailService } from '../../services/emailService/emailService.js';
import { ResetPasswordEmail } from '../../types/emails/resetPasswordEmail.js';

export class ResetUserPasswordCommandHandlerImpl implements ResetUserPasswordCommandHandler {
  public constructor(
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly configProvider: UserModuleConfigProvider,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { email } = payload;

    const user = await this.userRepository.findUser({
      email,
    });

    if (!user) {
      this.loggerService.debug({
        message: 'User not found.',
        context: { email },
      });

      return;
    }

    this.loggerService.debug({
      message: 'Sending reset password email...',
      context: {
        userId: user.getId(),
        email: user.getEmail(),
      },
    });

    const expiresIn = this.configProvider.getResetPasswordTokenExpiresIn();

    const resetPasswordToken = this.tokenService.createToken({
      data: { userId: user.getId() },
      expiresIn,
    });

    user.addUpdateResetPasswordTokenAction({
      resetPasswordToken,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    const frontendUrl = this.configProvider.getFrontendUrl();

    const resetPasswordLink = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;

    await this.emailService.sendEmail(
      new ResetPasswordEmail({
        recipient: user.getEmail(),
        templateData: {
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          resetPasswordLink,
        },
      }),
    );

    this.loggerService.info({
      message: 'Reset password email sent.',
      context: {
        userId: user.getId(),
        email: user.getEmail(),
      },
    });
  }
}
