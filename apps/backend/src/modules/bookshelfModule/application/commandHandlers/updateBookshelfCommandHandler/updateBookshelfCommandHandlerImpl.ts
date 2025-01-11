import {
  type UpdateBookshelfCommandHandler,
  type UpdateBookshelfPayload,
  type UpdateBookshelfResult,
} from './updateBookshelfCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class UpdateBookshelfCommandHandlerImpl implements UpdateBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookshelfPayload): Promise<UpdateBookshelfResult> {
    const { bookshelfId, userId, name, imageUrl } = payload;

    if (name === undefined && imageUrl === undefined) {
      throw new OperationNotValidError({
        reason: 'At least one of the following fields must be provided: name, imageUrl.',
        bookshelfId,
        userId,
      });
    }

    this.loggerService.debug({
      message: 'Updating Bookshelf...',
      bookshelfId,
      userId,
      name,
      imageUrl,
    });

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!existingBookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        bookshelfId,
        userId,
      });
    }

    if (userId !== existingBookshelf.getUserId()) {
      throw new OperationNotValidError({
        reason: 'User does not have permission to update this bookshelf.',
        bookshelfId,
        name,
        userId,
      });
    }

    if (name !== undefined) {
      const bookshelfWithSameName = await this.bookshelfRepository.findBookshelf({
        where: {
          userId,
          name,
        },
      });

      if (bookshelfWithSameName && bookshelfWithSameName.getId() !== bookshelfId) {
        throw new ResourceAlreadyExistsError({
          resource: 'Bookshelf',
          name,
          userId,
        });
      }

      existingBookshelf.setName({ name });
    }

    if (imageUrl !== undefined) {
      existingBookshelf.setImageUrl({ imageUrl });
    }

    const updatedBookshelf = await this.bookshelfRepository.saveBookshelf({ bookshelf: existingBookshelf });

    this.loggerService.debug({
      message: 'Bookshelf updated.',
      bookshelfId,
      userId,
      name,
      imageUrl,
    });

    return {
      bookshelf: updatedBookshelf,
    };
  }
}
