import {
  type RegisterUserCommandHandler,
  type RegisterUserCommandHandlerPayload,
  type RegisterUserCommandHandlerResult,
} from './registerUserCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { TokenType } from '../../../domain/types/tokenType.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';
import { type HashService } from '../../services/hashService/hashService.js';
import { type PasswordValidationService } from '../../services/passwordValidationService/passwordValidationService.js';

export class RegisterUserCommandHandlerImpl implements RegisterUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly configProvider: UserModuleConfigProvider,
    private readonly loggerService: LoggerService,
    private readonly tokenService: TokenService,
    private readonly emailMessageBus: EmailMessageBus,
    private readonly passwordValidationService: PasswordValidationService,
  ) {}

  public async execute(payload: RegisterUserCommandHandlerPayload): Promise<RegisterUserCommandHandlerResult> {
    const { email: emailInput, password, name } = payload;

    const email = emailInput.toLowerCase();

    this.loggerService.debug({
      message: 'Registering User...',
      context: {
        email,
        name,
      },
    });

    const existingUser = await this.userRepository.findUser({ email });

    if (existingUser) {
      throw new ResourceAlreadyExistsError({
        name: 'User',
        email,
      });
    }

    this.passwordValidationService.validate({ password });

    const hashedPassword = await this.hashService.hash({ plainData: password });

    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
      name,
      isEmailVerified: false,
    });

    this.loggerService.info({
      message: 'User registered.',
      context: {
        email,
        userId: user.getId(),
      },
    });

    this.loggerService.debug({
      message: 'Sending verification email...',
      context: {
        userId: user.getId(),
        email: user.getEmail(),
      },
    });

    const expiresIn = this.configProvider.getEmailVerificationTokenExpiresIn();

    const emailVerificationToken = this.tokenService.createToken({
      data: {
        userId: user.getId(),
        type: TokenType.emailVerification,
      },
      expiresIn,
    });

    const frontendUrl = this.configProvider.getFrontendUrl();

    const emailVerificationLink = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;

    await this.emailMessageBus.sendEvent(
      new EmailEventDraft({
        eventName: EmailEventType.verifyEmail,
        payload: {
          name: user.getName(),
          recipientEmail: user.getEmail(),
          emailVerificationLink,
        },
      }),
    );

    return { user };
  }
}
