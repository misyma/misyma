import {
  type CreateAuthorCommandHandler,
  type CreateAuthorCommandHandlerPayload,
  type CreateAuthorCommandHandlerResult,
} from './createAuthorCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';

export class CreateAuthorCommandHandlerImpl implements CreateAuthorCommandHandler {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateAuthorCommandHandlerPayload): Promise<CreateAuthorCommandHandlerResult> {
    const { firstName, lastName } = payload;

    this.loggerService.debug({
      message: 'Creating author...',
      context: {
        firstName,
        lastName,
      },
    });

    const existingAuthor = await this.authorRepository.findAuthor({
      firstName,
      lastName,
    });

    if (existingAuthor) {
      throw new ResourceAlreadyExistsError({
        name: 'Author',
        id: existingAuthor.id,
        firstName,
        lastName,
      });
    }

    const author = await this.authorRepository.createAuthor({
      firstName,
      lastName,
    });

    this.loggerService.info({
      message: 'Author created.',
      context: {
        authorId: author.id,
        firstName,
        lastName,
      },
    });

    return { author };
  }
}
