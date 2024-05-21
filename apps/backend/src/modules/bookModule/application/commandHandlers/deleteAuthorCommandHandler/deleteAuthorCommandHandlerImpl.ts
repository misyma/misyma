import {
  type DeleteAuthorCommandHandler,
  type DeleteAuthorCommandHandlerPayload,
} from './deleteAuthorCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';

export class DeleteAuthorCommandHandlerImpl implements DeleteAuthorCommandHandler {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteAuthorCommandHandlerPayload): Promise<void> {
    const { authorId } = payload;

    this.loggerService.debug({
      message: 'Deleting author...',
      authorId,
    });

    const existingAuthor = await this.authorRepository.findAuthor({ id: authorId });

    if (!existingAuthor) {
      throw new ResourceNotFoundError({
        resource: 'Author',
        id: authorId,
      });
    }

    await this.authorRepository.deleteAuthor({ id: authorId });

    this.loggerService.debug({
      message: 'Author deleted.',
      authorId,
    });
  }
}
