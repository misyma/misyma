import {
  type FindAuthorQueryHandler,
  type FindAuthorQueryHandlerPayload,
  type FindAuthorQueryHandlerResult,
} from './findAuthorQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';

export class FindAuthorQueryHandlerImpl implements FindAuthorQueryHandler {
  public constructor(private readonly authorRepository: AuthorRepository) {}

  public async execute(payload: FindAuthorQueryHandlerPayload): Promise<FindAuthorQueryHandlerResult> {
    const { authorId } = payload;

    const author = await this.authorRepository.findAuthor({ id: authorId });

    if (!author) {
      throw new ResourceNotFoundError({
        name: 'Author',
        id: authorId,
      });
    }

    return { author };
  }
}
