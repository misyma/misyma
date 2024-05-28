import {
  type CreateQuoteCommandHandler,
  type CreateQuotePayload,
  type CreateQuoteResult,
} from './createQuoteCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';

export class CreateQuoteCommandHandlerImpl implements CreateQuoteCommandHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateQuotePayload): Promise<CreateQuoteResult> {
    const { userBookId, content, createdAt, isFavorite, page } = payload;

    this.loggerService.debug({
      message: 'Creating Quote...',
      userBookId,
      content,
      createdAt,
      isFavorite,
      page,
    });

    const existingUserBook = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!existingUserBook) {
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
        id: userBookId,
      });
    }

    const quote = await this.quoteRepository.saveQuote({
      quote: {
        userBookId,
        content,
        createdAt,
        isFavorite,
        page,
      },
    });

    this.loggerService.debug({
      message: 'Quote created.',
      id: quote.getId(),
      userBookId,
      content,
      createdAt,
      isFavorite,
      page,
    });

    return { quote };
  }
}
