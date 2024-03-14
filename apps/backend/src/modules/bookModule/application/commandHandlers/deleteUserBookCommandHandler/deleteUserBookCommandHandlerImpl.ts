import {
  type DeleteUserBookCommandHandler,
  type DeleteUserBookCommandHandlerPayload,
} from './deleteUserBookCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class DeleteUserBookCommandHandlerImpl implements DeleteUserBookCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteUserBookCommandHandlerPayload): Promise<void> {
    const { userBookId } = payload;

    this.loggerService.debug({
      message: 'Deleting book...',
      id: userBookId,
    });

    await this.userBookRepository.deleteUserBook({ id: userBookId });

    this.loggerService.debug({
      message: 'Book deleted.',
      id: userBookId,
    });
  }
}
