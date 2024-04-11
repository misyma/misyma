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
    const { name, isApproved } = payload;

    this.loggerService.debug({
      message: 'Creating author...',
      name,
      isApproved,
    });

    const existingAuthor = await this.authorRepository.findAuthor({
      name,
    });

    if (existingAuthor) {
      throw new ResourceAlreadyExistsError({
        resource: 'Author',
        id: existingAuthor.getId(),
        name,
      });
    }

    const author = await this.authorRepository.createAuthor({
      name,
      isApproved,
    });

    this.loggerService.debug({
      message: 'Author created.',
      authorId: author.getId(),
      name,
      isApproved,
    });

    return { author };
  }
}
