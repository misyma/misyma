import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

import {
  type FindBookshelfByIdPayload,
  type FindBookshelfByIdQueryHandler,
  type FindBookshelfByIdResult,
} from './findBookshelfByIdQueryHandler.js';

export class FindBookshelfByIdQueryHandlerImpl implements FindBookshelfByIdQueryHandler {
  public constructor(private readonly bookshelfRepository: BookshelfRepository) {}

  public async execute(payload: FindBookshelfByIdPayload): Promise<FindBookshelfByIdResult> {
    const { bookshelfId, userId } = payload;

    const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        bookshelfId,
      });
    }

    if (userId !== bookshelf.getUserId()) {
      throw new OperationNotValidError({
        reason: 'User does not have permission to view this bookshelf.',
        bookshelfId,
        userId,
      });
    }

    return { bookshelf };
  }
}
