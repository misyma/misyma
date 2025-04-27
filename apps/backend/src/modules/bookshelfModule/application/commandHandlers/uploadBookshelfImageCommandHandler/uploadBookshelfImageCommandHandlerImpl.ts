import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type Config } from '../../../../../core/config.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type S3Service } from '../../../../../libs/s3/s3Service.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

import {
  type UploadBookshelfImageCommandHandlerResult,
  type UploadBookshelfImageCommandHandler,
  type UploadBookshelfImageCommandHandlerPayload,
} from './uploadBookshelfImageCommandHandler.js';

export class UploadBookshelfImageCommandHandlerImpl implements UploadBookshelfImageCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly s3Service: S3Service,
    private readonly loggerService: LoggerService,
    private readonly config: Config,
    private readonly uuidService: UuidService,
  ) {}

  public async execute(
    payload: UploadBookshelfImageCommandHandlerPayload,
  ): Promise<UploadBookshelfImageCommandHandlerResult> {
    const { userId, bookshelfId, contentType, data } = payload;

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({
      where: { id: bookshelfId },
    });

    if (!existingBookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: bookshelfId,
      });
    }

    if (existingBookshelf.getUserId() !== userId) {
      throw new OperationNotValidError({
        reason: 'User does not own this Bookshelf.',
        userId,
        bookshelfId,
      });
    }

    const { bucketName } = this.config.aws;

    this.loggerService.debug({
      message: 'Uploading Bookshelf image...',
      bucketName,
      bookshelfId,
      contentType,
    });

    const imageId = this.uuidService.generateUuid();

    await this.s3Service.uploadBlob({
      bucketName,
      blobName: imageId,
      data,
      contentType,
    });

    const imageUrl = `${this.config.aws.cloudfrontUrl}/${imageId}`;

    this.loggerService.debug({
      message: 'Bookshelf image uploaded.',
      bucketName,
      bookshelfId,
      imageUrl,
      contentType,
    });

    const previousImageUrl = existingBookshelf.getImageUrl();

    existingBookshelf.setImageUrl({ imageUrl });

    await this.bookshelfRepository.saveBookshelf({ bookshelf: existingBookshelf });

    if (previousImageUrl) {
      await this.deletePreviousImage({
        bookshelfId,
        previousImageUrl,
      });
    }

    this.loggerService.debug({
      message: 'Bookshelf saved.',
      bookshelfId,
    });

    return { bookshelf: existingBookshelf };
  }

  private async deletePreviousImage({
    bookshelfId,
    previousImageUrl,
  }: {
    readonly bookshelfId: string;
    readonly previousImageUrl: string;
  }): Promise<void> {
    const previousImageId = previousImageUrl.split('/').slice(-1)[0];

    if (!previousImageId) {
      return;
    }

    const { bucketName } = this.config.aws;

    this.loggerService.debug({
      message: 'Deleting previous Bookshelf image...',
      bucketName,
      bookshelfId,
      previousImageId,
    });

    try {
      await this.s3Service.deleteBlob({
        bucketName,
        blobName: previousImageId,
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error deleting previous Bookshelf image.',
        bucketName,
        bookshelfId,
        previousImageId,
        error,
      });

      return;
    }

    this.loggerService.debug({
      message: 'Previous Bookshelf image deleted.',
      bucketName,
      bookshelfId,
      previousImageId,
    });
  }
}
