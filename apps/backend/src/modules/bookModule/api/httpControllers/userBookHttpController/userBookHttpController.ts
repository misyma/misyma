import { type Language, type BookFormat, type UserBookExpandField } from '@common/contracts';

import {
  createUserBookBodyDtoSchema,
  createUserBookResponseBodyDtoSchema,
  type CreateUserBookBodyDto,
  type CreateUserBookResponseBodyDto,
} from './schemas/createUserBookSchema.js';
import {
  type DeleteUserBookResponseBodyDto,
  deleteUserBookPathParamsDtoSchema,
  deleteUserBookResponseBodyDtoSchema,
  type DeleteUserBookPathParamsDto,
} from './schemas/deleteUserBookSchema.js';
import {
  findUserBookPathParamsDtoSchema,
  findUserBookResponseBodyDtoSchema,
  type FindUserBookPathParamsDto,
  type FindUserBookResponseBodyDto,
} from './schemas/findUserBookSchema.js';
import {
  type FindUserBooksQueryParamsDto,
  findUserBooksResponseBodyDtoSchema,
  type FindUserBooksResponseBodyDto,
  findUserBooksQueryParamsDtoSchema,
} from './schemas/findUserBooksSchema.js';
import {
  updateUserBookPathParamsDtoSchema,
  updateUserBookBodyDtoSchema,
  updateUserBookResponseBodyDtoSchema,
  type UpdateUserBookBodyDto,
  type UpdateUserBookPathParamsDto,
  type UpdateUserBookResponseBodyDto,
} from './schemas/updateUserBookSchema.js';
import {
  type UploadUserBookImageResponseBodyDtoSchema,
  type UploadUserBookImagePathParamsDto,
  uploadUserBookImageResponseBodyDtoSchema,
  uploadUserBookImagePathParamsDtoSchema,
} from './schemas/uploadUserBookImageSchema.js';
import { type UserBookDto } from './schemas/userBookDto.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateUserBookCommandHandler } from '../../../application/commandHandlers/createUserBookCommandHandler/createUserBookCommandHandler.js';
import { type DeleteUserBookCommandHandler } from '../../../application/commandHandlers/deleteUserBookCommandHandler/deleteUserBookCommandHandler.js';
import { type UpdateUserBookCommandHandler } from '../../../application/commandHandlers/updateUserBookCommandHandler/updateUserBookCommandHandler.js';
import { type UploadUserBookImageCommandHandler } from '../../../application/commandHandlers/uploadUserBookImageCommandHandler/uploadUserBookImageCommandHandler.js';
import { type FindUserBookQueryHandler } from '../../../application/queryHandlers/findUserBookQueryHandler/findUserBookQueryHandler.js';
import { type FindUserBooksQueryHandler } from '../../../application/queryHandlers/findUserBooksQueryHandler/findUserBooksQueryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';
import { type BookReadingDto } from '../bookReadingHttpController/schemas/bookReadingDto.js';

export class UserBookHttpController implements HttpController {
  public readonly basePath = '/user-books';
  public readonly tags = ['UserBook'];

  public constructor(
    private readonly createUserBookCommandHandler: CreateUserBookCommandHandler,
    private readonly updateUserBookCommandHandler: UpdateUserBookCommandHandler,
    private readonly deleteUserBookCommandHandler: DeleteUserBookCommandHandler,
    private readonly findUserBookQueryHandler: FindUserBookQueryHandler,
    private readonly findUserBooksQueryHandler: FindUserBooksQueryHandler,
    private readonly uploadUserBookImageCommandHandler: UploadUserBookImageCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createUserBook.bind(this),
        schema: {
          request: {
            body: createUserBookBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createUserBookResponseBodyDtoSchema,
              description: "User's book created",
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: "Create user's book",
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':userBookId',
        handler: this.findUserBook.bind(this),
        schema: {
          request: {
            pathParams: findUserBookPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserBookResponseBodyDtoSchema,
              description: "User's book found",
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: "Find user's book by id",
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findUserBooks.bind(this),
        description: "Find user's books",
        schema: {
          request: {
            queryParams: findUserBooksQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserBooksResponseBodyDtoSchema,
              description: "User's books found",
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':userBookId',
        handler: this.deleteUserBook.bind(this),
        schema: {
          request: {
            pathParams: deleteUserBookPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserBookResponseBodyDtoSchema,
              description: "User's book deleted",
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: "Delete user's book",
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':userBookId',
        description: "Update user's book",
        handler: this.updateUserBook.bind(this),
        schema: {
          request: {
            pathParams: updateUserBookPathParamsDtoSchema,
            body: updateUserBookBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: "User's book updated",
              schema: updateUserBookResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':userBookId/images',
        description: "Upload user book's image",
        handler: this.uploadUserBookImage.bind(this),
        schema: {
          request: {
            pathParams: uploadUserBookImagePathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: "User book's image uploaded",
              schema: uploadUserBookImageResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async updateUserBook(
    request: HttpRequest<UpdateUserBookBodyDto, undefined, UpdateUserBookPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateUserBookResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { status, bookshelfId, imageUrl, isFavorite, genreIds, collectionIds } = request.body;

    const { userBook } = await this.updateUserBookCommandHandler.execute({
      userId,
      userBookId,
      status,
      isFavorite,
      bookshelfId,
      imageUrl,
      genreIds,
      collectionIds,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async uploadUserBookImage(
    request: HttpRequest<undefined, undefined, UploadUserBookImagePathParamsDto>,
  ): Promise<HttpOkResponse<UploadUserBookImageResponseBodyDtoSchema>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    if (!request.file) {
      throw new OperationNotValidError({
        reason: 'No file attached',
      });
    }

    const { userBook } = await this.uploadUserBookImageCommandHandler.execute({
      userId,
      userBookId,
      data: request.file.data,
      contentType: request.file.type,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async createUserBook(
    request: HttpRequest<CreateUserBookBodyDto>,
  ): Promise<HttpCreatedResponse<CreateUserBookResponseBodyDto>> {
    const { bookId, bookshelfId, status, imageUrl, isFavorite, collectionIds, genreIds } = request.body;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBook } = await this.createUserBookCommandHandler.execute({
      userId,
      bookId,
      bookshelfId,
      status,
      imageUrl,
      isFavorite,
      collectionIds,
      genreIds,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async findUserBook(
    request: HttpRequest<undefined, undefined, FindUserBookPathParamsDto>,
  ): Promise<HttpOkResponse<FindUserBookResponseBodyDto>> {
    const { userBookId } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBook } = await this.findUserBookQueryHandler.execute({
      userId,
      userBookId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async findUserBooks(
    request: HttpRequest<undefined, FindUserBooksQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindUserBooksResponseBodyDto>> {
    const { userId: requesterUserId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const {
      page = 1,
      pageSize = 10,
      bookshelfId,
      collectionId,
      userId,
      isbn,
      title,
      sortDate,
      expandFields,
    } = request.queryParams;

    const { userBooks, total } = await this.findUserBooksQueryHandler.execute({
      requesterUserId,
      bookshelfId,
      collectionId,
      userId,
      isbn,
      title,
      page,
      pageSize,
      sortDate,
      expandFields: (expandFields?.split(',') as UserBookExpandField[]) || [],
    });

    return {
      body: {
        data: userBooks.map((userBook) => this.mapUserBookToUserBookDto(userBook)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async deleteUserBook(
    request: HttpRequest<undefined, undefined, DeleteUserBookPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteUserBookResponseBodyDto>> {
    const { userBookId } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    await this.deleteUserBookCommandHandler.execute({
      userId,
      userBookId,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapUserBookToUserBookDto(userBook: UserBook): UserBookDto {
    const { status, isFavorite, bookshelfId, imageUrl, bookId, genres, book, readings, collections, createdAt } =
      userBook.getState();

    const userBookDto: UserBookDto = {
      id: userBook.getId(),
      status,
      isFavorite,
      bookshelfId,
      createdAt: createdAt.toISOString(),
      bookId,
      book: {
        title: book?.title as string,
        language: book?.language as Language,
        isApproved: book?.isApproved as boolean,
        format: book?.format as BookFormat,
        createdAt: book?.createdAt.toISOString() as string,
        authors:
          book?.authors.map((author) => ({
            id: author.getId(),
            name: author.getName(),
            isApproved: author.getIsApproved(),
            createdAt: author.getCreatedAt().toISOString(),
          })) || [],
      },
      genres:
        genres.map((genre) => ({
          id: genre.getId(),
          name: genre.getName(),
        })) || [],
      collections:
        collections.map((collection) => ({
          id: collection.getId(),
          name: collection.getName(),
          userId: collection.getUserId(),
          createdAt: collection.getCreatedAt().toISOString(),
        })) || [],
      readings:
        readings.map((reading) => {
          const { userBookId, comment, rating, startedAt, endedAt } = reading.getState();

          let readingDto: BookReadingDto = {
            id: reading.getId(),
            startedAt: startedAt.toISOString(),
            endedAt: endedAt.toISOString(),
            rating,
            userBookId,
          };

          if (comment) {
            readingDto = {
              ...readingDto,
              comment,
            };
          }

          return readingDto;
        }) || [],
    };

    if (imageUrl) {
      userBookDto.imageUrl = imageUrl;
    }

    if (book?.isbn) {
      userBookDto.book.isbn = book.isbn;
    }

    if (book?.publisher) {
      userBookDto.book.publisher = book.publisher;
    }

    if (book?.releaseYear) {
      userBookDto.book.releaseYear = book.releaseYear;
    }

    if (book?.translator) {
      userBookDto.book.translator = book.translator;
    }

    if (book?.pages) {
      userBookDto.book.pages = book.pages;
    }

    if (book?.imageUrl) {
      userBookDto.book.imageUrl = book.imageUrl;
    }

    return userBookDto;
  }
}
