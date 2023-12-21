import {
  type ExecutePayload,
  type ExecuteResult,
  type FindAuthorsByIdsQueryHandler,
} from './findAuthorsByIdsQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';

export class FindAuthorsByIdsQueryHandlerImpl implements FindAuthorsByIdsQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { authorIds } = payload;

    const authors = await this.authorRepository.findAuthorsByIds({ authorIds });

    if (authorIds.length !== authors.length) {
      const missingIds = authorIds.filter((authorId) => !authors.some((author) => author.id === authorId));

      throw new ResourceNotFoundError({
        name: 'Author',
        missingIds,
      });
    }

    return { authors };
  }
}
