import {
  type DeleteAuthorCommandHandler,
  type DeleteAuthorCommandHandlerPayload,
} from './deleteAuthorCommandHandler.js';
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
      context: { authorId },
    });

    await this.authorRepository.deleteAuthor({ id: authorId });

    this.loggerService.info({
      message: 'Author deleted.',
      context: { authorId },
    });
  }
}
