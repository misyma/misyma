import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

import { type DeleteUserCommandHandler, type DeleteUserCommandHandlerPayload } from './deleteUserCommandHandler.js';

export class DeleteUserCommandHandlerImpl implements DeleteUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteUserCommandHandlerPayload): Promise<void> {
    const { userId } = payload;

    this.loggerService.debug({
      message: 'Deleting User...',
      userId,
    });

    const existingUser = await this.userRepository.findUser({ id: userId });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        resource: 'User',
        userId,
      });
    }

    await this.userRepository.deleteUser({ id: userId });

    this.loggerService.debug({
      message: 'User deleted.',
      userId,
    });
  }
}
