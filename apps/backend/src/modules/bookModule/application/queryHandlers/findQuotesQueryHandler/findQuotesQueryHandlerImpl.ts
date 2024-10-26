import {
  type FindQuotesQueryHandlerPayload,
  type FindQuotesQueryHandler,
  type FindQuotesQueryHandlerResult,
} from './findQuotesQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import {
  type FindQuotesPayload,
  type QuoteRepository,
} from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindQuotesQueryHandlerImpl implements FindQuotesQueryHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindQuotesQueryHandlerPayload): Promise<FindQuotesQueryHandlerResult> {
    const { userId, userBookId, page, pageSize, sortDate } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const { userId: ownerId } = await this.userBookRepository.findUserBookOwner({
      id: userBookId,
    });

    if (userId !== ownerId) {
      throw new OperationNotValidError({
        reason: 'User does not own the UserBook.',
        userId,
        userBookId,
      });
    }

    let findQuotesPayload: FindQuotesPayload = {
      userBookId,
      page,
      pageSize,
    };

    if (sortDate) {
      findQuotesPayload = {
        ...findQuotesPayload,
        sortDate,
      };
    }

    const [quotes, total] = await Promise.all([
      this.quoteRepository.findQuotes(findQuotesPayload),
      this.quoteRepository.countQuotes({ userBookId }),
    ]);

    return {
      quotes,
      total,
    };
  }
}
