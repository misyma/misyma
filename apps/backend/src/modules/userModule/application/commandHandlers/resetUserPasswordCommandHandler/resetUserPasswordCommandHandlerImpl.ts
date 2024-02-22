import { type ExecutePayload, type ResetUserPasswordCommandHandler } from './resetUserPasswordCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { TokenPurpose } from '../../../domain/types/tokenPurpose.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';

export class ResetUserPasswordCommandHandlerImpl implements ResetUserPasswordCommandHandler {
  public constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly configProvider: UserModuleConfigProvider,
    private readonly emailMessageBus: EmailMessageBus,
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
      data: {
        userId: user.getId(),
        purpose: TokenPurpose.passwordReset,
      },
      expiresIn,
    });

    await this.userRepository.updateUser({
      id: user.getId(),
      domainActions: user.getDomainActions(),
    });

    const frontendUrl = this.configProvider.getFrontendUrl();

    const resetPasswordLink = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;

    await this.emailMessageBus.sendEvent(
      new EmailEventDraft({
        eventName: EmailEventType.resetPassword,
        payload: {
          name: user.getName(),
          recipientEmail: user.getEmail(),
          resetPasswordLink,
        },
      }),
    );
  }
}
