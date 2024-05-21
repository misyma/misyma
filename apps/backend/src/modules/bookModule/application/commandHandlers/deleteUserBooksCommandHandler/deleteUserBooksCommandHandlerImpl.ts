import {
  type DeleteUserBooksCommandHandler,
  type DeleteUserBooksCommandHandlerPayload,
} from './deleteUserBooksCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class DeleteUserBooksCommandHandlerImpl implements DeleteUserBooksCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteUserBooksCommandHandlerPayload): Promise<void> {
    const { userBookIds } = payload;

    this.loggerService.debug({
      message: `Deleting Users's books...`,
      ids: userBookIds,
    });

    const existingUserBooks = await this.userBookRepository.findUserBooks({
      ids: userBookIds,
      page: 1,
      pageSize: userBookIds.length,
    });

    if (existingUserBooks.length !== userBookIds.length) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        ids: userBookIds,
      });
    }

    await this.userBookRepository.deleteUserBooks({ ids: userBookIds });

    this.loggerService.debug({
      message: `User's books deleted.`,
      ids: userBookIds,
    });
  }
}
