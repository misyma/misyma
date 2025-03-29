import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type Config } from '../../../../../core/config.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type UploadUserBookImageCommandHandlerResult,
  type UploadUserBookImageCommandHandler,
  type UploadUserBookImageCommandHandlerPayload,
} from './uploadUserBookImageCommandHandler.js';

export class UploadUserBookImageCommandHandlerImpl implements UploadUserBookImageCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly s3Service: S3Service,
    private readonly loggerService: LoggerService,
    private readonly config: Config,
    private readonly uuidService: UuidService,
  ) {}

  public async execute(
    payload: UploadUserBookImageCommandHandlerPayload,
  ): Promise<UploadUserBookImageCommandHandlerResult> {
    const { userId, userBookId, contentType, data } = payload;

    const existingUserBook = await this.userBookRepository.findUserBook({ id: userBookId });

    if (!existingUserBook) {
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
        id: userBookId,
      });
    }

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({
      where: { id: existingUserBook.getBookshelfId() },
    });

    if (!existingBookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: existingUserBook.getBookshelfId(),
      });
    }

    if (existingBookshelf.getUserId() !== userId) {
      throw new OperationNotValidError({
        reason: 'User does not own this UserBook.',
        userId,
        userBookId,
      });
    }

    const { bucketName } = this.config.aws;

    this.loggerService.debug({
      message: 'Uploading UserBook image...',
      bucketName,
      userBookId,
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
      message: 'UserBook image uploaded.',
      bucketName,
      userBookId,
      imageUrl,
      contentType,
    });

    const previousImageUrl = existingUserBook.getImageUrl();

    existingUserBook.setImageUrl({ imageUrl });

    await this.userBookRepository.saveUserBook({ userBook: existingUserBook });

    if (previousImageUrl) {
      await this.deletePreviousImage({
        userBookId,
        previousImageUrl,
      });
    }

    this.loggerService.debug({
      message: 'UserBook saved.',
      userBookId,
    });

    return { userBook: existingUserBook };
  }

  private async deletePreviousImage({
    userBookId,
    previousImageUrl,
  }: {
    readonly userBookId: string;
    readonly previousImageUrl: string;
  }): Promise<void> {
    const previousImageId = previousImageUrl.split('/').slice(-1)[0];

    if (!previousImageId) {
      return;
    }

    const { bucketName } = this.config.aws;

    this.loggerService.debug({
      message: 'Deleting previous UserBook image...',
      bucketName,
      userBookId,
      previousImageId,
    });

    try {
      await this.s3Service.deleteBlob({
        bucketName,
        blobName: previousImageId,
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error deleting previous UserBook image.',
        bucketName,
        userBookId,
        previousImageId,
        error,
      });

      return;
    }

    this.loggerService.debug({
      message: 'Previous UserBook image deleted.',
      bucketName,
      userBookId,
      previousImageId,
    });
  }
}
