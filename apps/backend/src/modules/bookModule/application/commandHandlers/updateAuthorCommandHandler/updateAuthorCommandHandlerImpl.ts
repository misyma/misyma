import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';

import {
  type UpdateAuthorCommandHandler,
  type UpdateAuthorPayload,
  type UpdateAuthorResult,
} from './updateAuthorCommandHandler.js';

export class UpdateAuthorCommandHandlerImpl implements UpdateAuthorCommandHandler {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateAuthorPayload): Promise<UpdateAuthorResult> {
    const { id, name, isApproved } = payload;

    this.loggerService.debug({
      message: 'Updating Author...',
      id,
      name,
      isApproved,
    });

    const existingAuthor = await this.authorRepository.findAuthor({ id });

    if (!existingAuthor) {
      throw new OperationNotValidError({
        reason: 'Author does not exist.',
        id,
      });
    }

    if (name) {
      const authorWithNameConflict = await this.authorRepository.findAuthor({ name });

      if (authorWithNameConflict) {
        throw new ResourceAlreadyExistsError({
          resource: 'Author',
          id: authorWithNameConflict.getId(),
          name: authorWithNameConflict.getName(),
        });
      }

      existingAuthor.setName({ name });
    }

    if (isApproved !== undefined) {
      existingAuthor.setIsApproved({ isApproved });
    }

    const author = await this.authorRepository.saveAuthor({
      author: existingAuthor,
    });

    this.loggerService.debug({
      message: 'Author updated.',
      id,
    });

    return { author };
  }
}
