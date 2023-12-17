import {
  type RegisterUserCommandHandler,
  type RegisterUserCommandHandlerPayload,
  type RegisterUserCommandHandlerResult,
} from './registerUserCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';

export class RegisterUserCommandHandlerImpl implements RegisterUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: RegisterUserCommandHandlerPayload): Promise<RegisterUserCommandHandlerResult> {
    const { email, password, firstName, lastName } = payload;

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

    const hashedPassword = await this.hashService.hash(password);

    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    this.loggerService.info({
      message: 'User registered.',
      context: {
        email,
        userId: user.id,
      },
    });

    return { user };
  }
}
