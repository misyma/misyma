import {
  type UploadUserBookImageCommandHandlerResult,
  type UploadUserBookImageCommandHandler,
  type UploadUserBookImageCommandHandlerPayload,
} from './uploadUserBookImageCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type Config } from '../../../../../core/config.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class UploadUserBookImageCommandHandlerImpl implements UploadUserBookImageCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly s3Service: S3Service,
    private readonly loggerService: LoggerService,
    private readonly config: Config,
  ) {}

  public async execute(
    payload: UploadUserBookImageCommandHandlerPayload,
  ): Promise<UploadUserBookImageCommandHandlerResult> {
    const { userBookId, contentType, data } = payload;

    const existingUserBook = await this.userBookRepository.findUserBook({ id: userBookId });

    if (!existingUserBook) {
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
        id: userBookId,
      });
    }

    const { bucketName } = this.config.aws;

    this.loggerService.debug({
      message: 'Uploading UserBook image...',
      bucketName,
      userBookId,
      contentType,
    });

    await this.s3Service.uploadBlob({
      bucketName,
      blobName: userBookId,
      data,
      contentType,
    });

    this.loggerService.debug({
      message: 'UserBook image uploaded.',
      bucketName,
      userBookId,
      contentType,
    });

    const imageUrl = `${this.config.aws.cloudfrontUrl}/${userBookId}`;

    existingUserBook.setImageUrl({ imageUrl });

    await this.userBookRepository.saveUserBook({ userBook: existingUserBook });

    this.loggerService.debug({
      message: 'UserBook saved.',
      userBookId,
    });

    return { userBook: existingUserBook };
  }
}
