import {
  type FindBookshelfByIdPayload,
  type FindBookshelfByIdQueryHandler,
  type FindBookshelfByIdResult,
} from './findBookshelfByIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class FindBookshelfByIdQueryHandlerImpl implements FindBookshelfByIdQueryHandler {
  public constructor(private readonly bookshelfRepository: BookshelfRepository) {}

  public async execute(payload: FindBookshelfByIdPayload): Promise<FindBookshelfByIdResult> {
    const { id } = payload;

    const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id } });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id,
      });
    }

    return { bookshelf };
  }
}
