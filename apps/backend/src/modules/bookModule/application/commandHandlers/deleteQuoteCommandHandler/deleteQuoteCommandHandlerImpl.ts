import { type DeleteQuoteCommandHandler, type DeleteQuotePayload } from './deleteQuoteCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class DeleteQuoteCommandHandlerImpl implements DeleteQuoteCommandHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteQuotePayload): Promise<void> {
    const { userId, quoteId } = payload;

    this.loggerService.debug({
      message: 'Deleting Quote...',
      id: quoteId,
    });

    const quote = await this.quoteRepository.findQuote({ id: quoteId });

    if (!quote) {
      throw new ResourceNotFoundError({
        resource: 'Quote',
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

    await this.quoteRepository.deleteQuote({ id: quoteId });

    this.loggerService.debug({
      message: 'Quote deleted.',
      id: quoteId,
    });
  }
}
