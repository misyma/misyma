import {
  type SendVerificationEmailCommandHandler,
  type ExecutePayload,
} from './sendVerificationEmailCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type EmailService } from '../../services/emailService/emailService.js';
import { VerificationEmail } from '../../types/emails/verificationEmail.js';

export class SendVerificationEmailCommandHandlerImpl implements SendVerificationEmailCommandHandler {
  public constructor(
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly configProvider: UserModuleConfigProvider,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { userId } = payload;

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
      message: 'Sending verification email...',
      context: {
        userId,
        email: user.getEmail(),
      },
    });

    const emailVerificationToken = this.tokenService.createToken({
      userId: user.getId(),
    });

    user.addUpdateEmailVerificationTokenAction({
      emailVerificationToken,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    const frontendUrl = this.configProvider.getFrontendUrl();

    const emailVerificationLink = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;

    await this.emailService.sendEmail(
      new VerificationEmail({
        recipient: user.getEmail(),
        templateData: {
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          emailVerificationLink,
        },
      }),
    );

    this.loggerService.info({
      message: 'Verification email sent.',
      context: {
        userId,
        email: user.getEmail(),
      },
    });
  }
}
