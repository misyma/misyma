import { emailTypes } from '../../../../../common/types/emailType.js';
import { TokenType } from '../../../../../common/types/tokenType.js';
import { type Config } from '../../../../../core/config.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEvent.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';

import {
  type ExecutePayload,
  type SendResetPasswordEmailCommandHandler,
} from './sendResetPasswordEmailCommandHandler.js';

export class SendResetPasswordEmailCommandHandlerImpl implements SendResetPasswordEmailCommandHandler {
  public constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly config: Config,
    private readonly emailMessageBus: EmailMessageBus,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { email: emailInput } = payload;

    const email = emailInput.toLowerCase();

    const user = await this.userRepository.findUser({ email });

    if (!user) {
      this.loggerService.debug({
        message: 'User not found.',
        email,
      });

      return;
    }

    this.loggerService.debug({
      message: 'Sending reset password email...',
      userId: user.getId(),
      email: user.getEmail(),
    });

    const resetPasswordToken = this.tokenService.createToken({
      data: {
        userId: user.getId(),
        type: TokenType.passwordReset,
      },
      expiresIn: this.config.token.resetPassword.expiresIn,
    });

    const resetPasswordLink = `${this.config.frontendUrl}/newPassword?token=${resetPasswordToken}`;

    await this.emailMessageBus.sendEvent(
      new EmailEventDraft({
        eventName: emailTypes.resetPassword,
        payload: {
          name: user.getName(),
          recipientEmail: user.getEmail(),
          resetPasswordLink,
        },
      }),
    );
  }
}
