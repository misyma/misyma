import { type Language } from '@common/contracts';

import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateUserBookCommandHandler } from '../../../application/commandHandlers/createUserBookCommandHandler/createUserBookCommandHandler.js';
import { type DeleteUserBookCommandHandler } from '../../../application/commandHandlers/deleteUserBookCommandHandler/deleteUserBookCommandHandler.js';
import { type UpdateUserBookCommandHandler } from '../../../application/commandHandlers/updateUserBookCommandHandler/updateUserBookCommandHandler.js';
import { type UploadUserBookImageCommandHandler } from '../../../application/commandHandlers/uploadUserBookImageCommandHandler/uploadUserBookImageCommandHandler.js';
import { type FindUserBookQueryHandler } from '../../../application/queryHandlers/findUserBookQueryHandler/findUserBookQueryHandler.js';
import { type FindUserBooksQueryHandler } from '../../../application/queryHandlers/findUserBooksQueryHandler/findUserBooksQueryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

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
        method: httpMethodNames.post,
        handler: this.createUserBook.bind(this),
        schema: {
          request: {
            body: createUserBookBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              schema: createUserBookResponseBodyDtoSchema,
              description: "User's book created",
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: "Create user's book",
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        path: ':userBookId',
        handler: this.findUserBook.bind(this),
        schema: {
          request: {
            pathParams: findUserBookPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findUserBookResponseBodyDtoSchema,
              description: "User's book found",
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: "Find user's book by id",
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findUserBooks.bind(this),
        description: "Find user's books",
        schema: {
          request: {
            queryParams: findUserBooksQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findUserBooksResponseBodyDtoSchema,
              description: "User's books found",
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':userBookId',
        handler: this.deleteUserBook.bind(this),
        schema: {
          request: {
            pathParams: deleteUserBookPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              schema: deleteUserBookResponseBodyDtoSchema,
              description: "User's book deleted",
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: "Delete user's book",
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':userBookId',
        description: "Update user's book",
        handler: this.updateUserBook.bind(this),
        schema: {
          request: {
            pathParams: updateUserBookPathParamsDtoSchema,
            body: updateUserBookBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: "User's book updated",
              schema: updateUserBookResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':userBookId/images',
        description: "Upload user book's image",
        handler: this.uploadUserBookImage.bind(this),
        schema: {
          request: {
            pathParams: uploadUserBookImagePathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
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
      requestHeaders: request.headers,
    });

    const { userBookId } = request.pathParams;

    const { status, bookshelfId, imageUrl, isFavorite, categoryId, collectionIds } = request.body;

    const { userBook } = await this.updateUserBookCommandHandler.execute({
      userId,
      userBookId,
      status,
      isFavorite,
      bookshelfId,
      imageUrl,
      categoryId,
      collectionIds,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapUserBookToDto(userBook),
    };
  }

  private async uploadUserBookImage(
    request: HttpRequest<undefined, undefined, UploadUserBookImagePathParamsDto>,
  ): Promise<HttpOkResponse<UploadUserBookImageResponseBodyDtoSchema>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
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
      statusCode: httpStatusCodes.ok,
      body: this.mapUserBookToDto(userBook),
    };
  }

  private async createUserBook(
    request: HttpRequest<CreateUserBookBodyDto>,
  ): Promise<HttpCreatedResponse<CreateUserBookResponseBodyDto>> {
    const { bookId, bookshelfId, status, imageUrl, isFavorite, collectionIds } = request.body;

    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { userBook } = await this.createUserBookCommandHandler.execute({
      userId,
      bookId,
      bookshelfId,
      status,
      imageUrl,
      isFavorite,
      collectionIds,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: this.mapUserBookToDto(userBook),
    };
  }

  private async findUserBook(
    request: HttpRequest<undefined, undefined, FindUserBookPathParamsDto>,
  ): Promise<HttpOkResponse<FindUserBookResponseBodyDto>> {
    const { userBookId } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { userBook } = await this.findUserBookQueryHandler.execute({
      userId,
      userBookId,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapUserBookToDto(userBook),
    };
  }

  private async findUserBooks(
    request: HttpRequest<undefined, FindUserBooksQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindUserBooksResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const {
      page = 1,
      pageSize = 10,
      bookshelfId,
      collectionId,
      authorId,
      categoryId,
      isbn,
      title,
      isFavorite,
      status,
      language,
      releaseYearAfter,
      releaseYearBefore,
      sortField,
      sortOrder,
      isRated,
    } = request.queryParams;

    const { userBooks, total } = await this.findUserBooksQueryHandler.execute({
      bookshelfId,
      collectionId,
      authorId,
      userId,
      categoryId,
      isbn,
      title,
      isFavorite,
      status,
      page,
      pageSize,
      sortField,
      sortOrder,
      language,
      releaseYearAfter,
      releaseYearBefore,
      isRated,
    });

    return {
      body: {
        data: userBooks.map((userBook) => this.mapUserBookToDto(userBook)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: httpStatusCodes.ok,
    };
  }

  private async deleteUserBook(
    request: HttpRequest<undefined, undefined, DeleteUserBookPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteUserBookResponseBodyDto>> {
    const { userBookId } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    await this.deleteUserBookCommandHandler.execute({
      userId,
      userBookId,
    });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private mapUserBookToDto(userBook: UserBook): UserBookDto {
    const { status, isFavorite, bookshelfId, imageUrl, bookId, book, collections, createdAt, latestRating } =
      userBook.getState();

    const userBookDto: UserBookDto = {
      id: userBook.id,
      status,
      isFavorite,
      bookshelfId,
      createdAt: createdAt.toISOString(),
      bookId,
      book: {
        title: book?.title as string,
        categoryId: book?.categoryId as string,
        categoryName: book?.category.getName() ?? '',
        language: book?.language as Language,
        isApproved: book?.isApproved as boolean,
        releaseYear: book?.releaseYear as number,
        authors:
          book?.authors.map((author) => ({
            id: author.getId(),
            name: author.getName(),
            isApproved: author.getIsApproved(),
          })) || [],
      },
      collections:
        collections?.map((collection) => ({
          id: collection.getId(),
          name: collection.getName(),
          userId: collection.getUserId(),
          createdAt: collection.getCreatedAt().toISOString(),
        })) || [],
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

    if (book?.translator) {
      userBookDto.book.translator = book.translator;
    }

    if (book?.pages) {
      userBookDto.book.pages = book.pages;
    }

    if (book?.imageUrl) {
      userBookDto.book.imageUrl = book.imageUrl;
    }

    if (book?.format) {
      userBookDto.book.format = book.format;
    }

    if (latestRating) {
      userBookDto.latestRating = latestRating;
    }

    return userBookDto;
  }
}
