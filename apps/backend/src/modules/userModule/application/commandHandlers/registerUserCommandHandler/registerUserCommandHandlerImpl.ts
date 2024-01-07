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
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';
import { type HashService } from '../../services/hashService/hashService.js';
import { type PasswordValidationService } from '../../services/passwordValidationService/passwordValidationService.js';

interface Dependencies {
  userRepository: UserRepository;
  hashService: HashService;
  configProvider: UserModuleConfigProvider;
  loggerService: LoggerService;
  tokenService: TokenService;
  emailMessageBus: EmailMessageBus;
  passwordValidationService: PasswordValidationService;
}

export class RegisterUserCommandHandlerImpl implements RegisterUserCommandHandler {
  private readonly userRepository: UserRepository;

  private readonly hashService: HashService;

  private readonly configProvider: UserModuleConfigProvider;

  private readonly loggerService: LoggerService;

  private readonly tokenService: TokenService;

  private readonly emailMessageBus: EmailMessageBus;

  private readonly passwordValidationService: PasswordValidationService;

  public constructor(dependencies: Dependencies) {
    const {
      configProvider,
      emailMessageBus,
      hashService,
      loggerService,
      tokenService,
      userRepository,
      passwordValidationService,
    } = dependencies;

    this.userRepository = userRepository;

    this.hashService = hashService;

    this.configProvider = configProvider;

    this.loggerService = loggerService;

    this.tokenService = tokenService;

    this.emailMessageBus = emailMessageBus;

    this.passwordValidationService = passwordValidationService;
  }

  public async execute(payload: RegisterUserCommandHandlerPayload): Promise<RegisterUserCommandHandlerResult> {
    const { email: emailInput, password, firstName, lastName } = payload;

    const email = emailInput.toLowerCase();

    this.loggerService.debug({
      message: 'Registering User...',
      context: {
        email,
        firstName,
        lastName,
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
      firstName,
      lastName,
      isEmailVerified: false,
    });

    const emailVerificationToken = this.tokenService.createToken({
      data: {
        userId: user.getId(),
      },
      expiresIn: this.configProvider.getEmailVerificationTokenExpiresIn(),
    });

    user.addUpdateEmailVerificationTokenAction({
      emailVerificationToken,
    });

    await this.userRepository.updateUser({
      domainActions: user.getDomainActions(),
      id: user.getId(),
    });

    this.loggerService.info({
      message: 'User registered.',
      context: {
        email,
        userId: user.getId(),
      },
    });

    await this.emailMessageBus.registerEvent(
      new EmailEventDraft({
        eventName: EmailEventType.verifyEmail,
        payload: {
          firstName,
          lastName,
          recipientEmail: email,
          emailVerificationToken: user,
        },
      }),
    );

    return { user };
  }
}
