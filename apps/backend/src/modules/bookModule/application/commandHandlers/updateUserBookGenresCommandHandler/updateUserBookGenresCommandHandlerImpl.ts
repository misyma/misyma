import {
  type UpdateUserBookGenresCommandHandler,
  type UpdateUserBookGenresPayload,
  type UpdateUserBookGenresResult,
} from './updateUserBookGenresCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class UpdateBookGenresCommandHandlerImpl implements UpdateUserBookGenresCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly genreRepository: GenreRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateUserBookGenresPayload): Promise<UpdateUserBookGenresResult> {
    const { userBookId, genreIds } = payload;

    this.loggerService.debug({
      message: 'Updating UserBook genres...',
      userBookId,
      genreIds,
    });

    const userBook = await this.userBookRepository.findUserBook({ id: userBookId });

    if (!userBook) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const genres = await this.genreRepository.findGenresByIds({
      ids: genreIds,
    });

    if (genres.length !== genreIds.length) {
      throw new ResourceNotFoundError({
        resource: 'Genre',
        id: genreIds,
      });
    }

    userBook.setGenres({ genres });

    await this.userBookRepository.saveUserBook({ userBook });

    this.loggerService.debug({
      message: 'UserBook genres updated.',
      userBookId,
      genreIds,
    });

    return { userBook };
  }
}
