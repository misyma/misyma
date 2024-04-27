import {
  type ExecutePayload,
  type ExecuteResult,
  type FindAuthorsByIdsQueryHandler,
} from './findAuthorsByIdsQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';

export class FindAuthorsByIdsQueryHandlerImpl implements FindAuthorsByIdsQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { authorIds, page, pageSize } = payload;

    const findAuthorsPayload = {
      ids: authorIds,
      page,
      pageSize,
    };

    const [authors, total] = await Promise.all([
      this.authorRepository.findAuthors(findAuthorsPayload),
      this.authorRepository.countAuthors(findAuthorsPayload),
    ]);

    if (authorIds.length !== authors.length) {
      const missingIds = authorIds.filter((authorId) => !authors.some((author) => author.getId() === authorId));

      throw new ResourceNotFoundError({
        resource: 'Author',
        missingIds,
      });
    }

    return {
      authors,
      total,
    };
  }
}
