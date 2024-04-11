import {
  type FindUserBookQueryHandler,
  type FindUserBookQueryHandlerPayload,
  type FindUserBookQueryHandlerResult,
} from './findUserBookQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindUserBookQueryHandlerImpl implements FindUserBookQueryHandler {
  public constructor(private readonly userBookRepository: UserBookRepository) {}

  public async execute(payload: FindUserBookQueryHandlerPayload): Promise<FindUserBookQueryHandlerResult> {
    const { userBookId } = payload;

    const userBook = await this.userBookRepository.findUserBook({ id: userBookId });

    if (!userBook) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    return { userBook };
  }
}
