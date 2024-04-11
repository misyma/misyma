import {
  type UpdateBookshelfCommandHandler,
  type UpdateBookshelfPayload,
  type UpdateBookshelfResult,
} from './updateBookshelfCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class UpdateBookshelfCommandHandlerImpl implements UpdateBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookshelfPayload): Promise<UpdateBookshelfResult> {
    const { id, name, imageUrl, userId, address } = payload;

    this.loggerService.debug({
      message: 'Updating Bookshelf...',
      id,
      name,
      userId,
      imageUrl,
      address,
    });

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({ where: { id } });

    if (!existingBookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id,
        userId,
      });
    }

    if (userId !== existingBookshelf.getUserId()) {
      throw new OperationNotValidError({
        reason: 'User does not have permission to update this bookshelf.',
        id,
        name,
        userId,
      });
    }

    if (name) {
      const bookshelfWithSameName = await this.bookshelfRepository.findBookshelf({
        where: {
          userId,
          name,
        },
      });

      if (bookshelfWithSameName && bookshelfWithSameName.getId() !== id) {
        throw new OperationNotValidError({
          reason: 'Bookshelf with this name already exists.',
          name,
          userId,
        });
      }

      existingBookshelf.setName({ name });
    }

    if (imageUrl) {
      existingBookshelf.setImageUrl({ imageUrl });
    }

    if (address) {
      existingBookshelf.setAddress({ address });
    }

    const updatedBookshelf = await this.bookshelfRepository.saveBookshelf({ bookshelf: existingBookshelf });

    this.loggerService.debug({
      message: 'Bookshelf updated.',
      id,
      name,
      userId,
      imageUrl,
      address,
    });

    return {
      bookshelf: updatedBookshelf,
    };
  }
}
