import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type UpdateQuoteCommandHandler,
  type UpdateQuotePayload,
  type UpdateQuoteResult,
} from './updateQuoteCommandHandler.js';

export class UpdateQuoteCommandHandlerImpl implements UpdateQuoteCommandHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateQuotePayload): Promise<UpdateQuoteResult> {
    const { userId, quoteId, content, isFavorite, page } = payload;

    this.loggerService.debug({
      message: 'Updating Quote...',
      id: quoteId,
      content,
      isFavorite,
      page,
    });

    const quote = await this.quoteRepository.findQuote({ id: quoteId });

    if (!quote) {
      throw new OperationNotValidError({
        reason: 'Quote does not exist.',
        id: quoteId,
      });
    }

    const { userId: ownerId } = await this.userBookRepository.findUserBookOwner({
      id: quote.getUserBookId(),
    });

    if (userId !== ownerId) {
      throw new OperationNotValidError({
        reason: 'User does not own the Quote.',
        userId,
        quoteId,
      });
    }

    if (content !== undefined) {
      quote.setContent({ content });
    }

    if (isFavorite !== undefined) {
      quote.setIsFavorite({ isFavorite });
    }

    if (page !== undefined) {
      quote.setPage({ page });
    }

    const updatedQuote = await this.quoteRepository.saveQuote({
      quote,
    });

    this.loggerService.debug({
      message: 'Quote updated.',
      id: quoteId,
      content,
      isFavorite,
    });

    return { quote: updatedQuote };
  }
}
