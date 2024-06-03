import {
  type FindQuotesPayload,
  type FindQuotesQueryHandler,
  type FindQuotesResult,
} from './findQuotesQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindQuotesQueryHandlerImpl implements FindQuotesQueryHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindQuotesPayload): Promise<FindQuotesResult> {
    const { userBookId, page, pageSize } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const findQuotesPayload = {
      userBookId,
      page,
      pageSize,
    };

    const [quotes, total] = await Promise.all([
      this.quoteRepository.findQuotes(findQuotesPayload),
      this.quoteRepository.countQuotes(findQuotesPayload),
    ]);

    return {
      quotes,
      total,
    };
  }
}
