import {
  type CreateAuthorCommandHandler,
  type CreateAuthorCommandHandlerPayload,
  type CreateAuthorCommandHandlerResult,
} from './createAuthorCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorRepository } from '../../../../authorModule/domain/repositories/authorRepository/authorRepository.js';

export class CreateAuthorCommandHandlerImpl implements CreateAuthorCommandHandler {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateAuthorCommandHandlerPayload): Promise<CreateAuthorCommandHandlerResult> {
    const { firstName, lastName } = payload;

    this.loggerService.debug({
      message: 'Creating author...',
      firstName,
      lastName,
    });

    const existingAuthor = await this.authorRepository.findAuthor({
      firstName,
      lastName,
    });

    if (existingAuthor) {
      throw new ResourceAlreadyExistsError({
        name: 'Author',
        id: existingAuthor.getId(),
        firstName,
        lastName,
      });
    }

    const author = await this.authorRepository.createAuthor({
      firstName,
      lastName,
    });

    this.loggerService.debug({
      message: 'Author created.',
      authorId: author.getId(),
      firstName,
      lastName,
    });

    return { author };
  }
}
