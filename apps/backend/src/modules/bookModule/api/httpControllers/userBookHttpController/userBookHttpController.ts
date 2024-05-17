import { type Language, type BookFormat } from '@common/contracts';

import {
  createUserBookBodyDtoSchema,
  createUserBookResponseBodyDtoSchema,
  type CreateUserBookBodyDto,
  type CreateUserBookResponseBodyDto,
} from './schemas/createUserBookSchema.js';
import {
  type DeleteUserBooksResponseBodyDto,
  deleteUserBooksQueryParamsDtoSchema,
  deleteUserBooksResponseBodyDtoSchema,
  type DeleteUserBooksQueryParamsDto,
} from './schemas/deleteUserBooksSchema.js';
import {
  type FindUserBooksByBookshelfIdQueryParamsDto,
  findUserBooksByBookshelfIdPathParamsDtoSchema,
  findUserBooksByBookshelfIdResponseBodyDtoSchema,
  type FindUserBooksByBookshelfIdPathParamsDto,
  type FindUserBooksByBookshelfIdResponseBodyDto,
} from './schemas/findUserBooksByBookshelfIdSchema.js';
import {
  findUserBookPathParamsDtoSchema,
  findUserBookResponseBodyDtoSchema,
  type FindUserBookPathParamsDto,
  type FindUserBookResponseBodyDto,
} from './schemas/findUserBookSchema.js';
import {
  updateUserBookGenresBodyDtoSchema,
  updateUserBookGenresPathParamsDtoSchema,
  updateUserBookGenresResponseBodyDtoSchema,
  type UpdateUserBookGenresBodyDto,
  type UpdateUserBookGenresPathParamsDto,
  type UpdateUserBookGenresResponseBodyDtoSchema,
} from './schemas/updateUserBookGenresSchema.js';
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
import { type DeleteUserBooksCommandHandler } from '../../../application/commandHandlers/deleteUserBooksCommandHandler/deleteUserBooksCommandHandler.js';
import { type UpdateUserBookCommandHandler } from '../../../application/commandHandlers/updateUserBookCommandHandler/updateUserBookCommandHandler.js';
import { type UpdateUserBookGenresCommandHandler } from '../../../application/commandHandlers/updateUserBookGenresCommandHandler/updateUserBookGenresCommandHandler.js';
import { type UploadUserBookImageCommandHandler } from '../../../application/commandHandlers/uploadUserBookImageCommandHandler/uploadUserBookImageCommandHandler.js';
import { type FindUserBookQueryHandler } from '../../../application/queryHandlers/findUserBookQueryHandler/findUserBookQueryHandler.js';
import { type FindUserBooksQueryHandler } from '../../../application/queryHandlers/findUserBooksQueryHandler/findUserBooksQueryHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export class UserBookHttpController implements HttpController {
  public readonly basePath = '/api/users/:userId/books';
  public readonly tags = ['UserBook'];

  public constructor(
    private readonly createUserBookCommandHandler: CreateUserBookCommandHandler,
    private readonly updateUserBookCommandHandler: UpdateUserBookCommandHandler,
    private readonly deleteUserBookCommandHandler: DeleteUserBooksCommandHandler,
    private readonly findUserBookQueryHandler: FindUserBookQueryHandler,
    private readonly findUserBooksQueryHandler: FindUserBooksQueryHandler,
    private readonly updateUserBookGenresCommandHandler: UpdateUserBookGenresCommandHandler,
    private readonly uploadUserBookImageCommandHandler: UploadUserBookImageCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  // TODO: add authorization based on userId from path
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
              description: `User's book created`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: `Create user's book`,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findUserBook.bind(this),
        schema: {
          request: {
            pathParams: findUserBookPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserBookResponseBodyDtoSchema,
              description: `User's book found`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: `Find user's book by id`,
      }),
      //TODO: refactor to search params
      new HttpRoute({
        method: HttpMethodName.get,
        path: '/bookshelf/:bookshelfId',
        handler: this.findUserBooksByBookshelfId.bind(this),
        description: `Find user's books by bookshelf id`,
        schema: {
          request: {
            pathParams: findUserBooksByBookshelfIdPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserBooksByBookshelfIdResponseBodyDtoSchema,
              description: `User's books found`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        handler: this.deleteUserBooks.bind(this),
        schema: {
          request: {
            queryParams: deleteUserBooksQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserBooksResponseBodyDtoSchema,
              description: `User's books deleted`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: `Delete user's books`,
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        description: `Update user's book`,
        handler: this.updateUserBook.bind(this),
        schema: {
          request: {
            pathParams: updateUserBookPathParamsDtoSchema,
            body: updateUserBookBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: `User's book updated`,
              schema: updateUserBookResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id/images',
        description: `Upload user book's image`,
        handler: this.uploadUserBookImage.bind(this),
        schema: {
          request: {
            pathParams: uploadUserBookImagePathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: `User book's image uploaded`,
              schema: uploadUserBookImageResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':userBookId/genres',
        description: `Update user's book genres`,
        handler: this.updateUserBookGenres.bind(this),
        schema: {
          request: {
            pathParams: updateUserBookGenresPathParamsDtoSchema,
            body: updateUserBookGenresBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: `User's book genres updated`,
              schema: updateUserBookGenresResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  // add authorization based on userId and userBook bookshelf

  private async updateUserBook(
    request: HttpRequest<UpdateUserBookBodyDto, undefined, UpdateUserBookPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateUserBookResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { status, bookshelfId, imageUrl, isFavorite } = request.body;

    const { userBook } = await this.updateUserBookCommandHandler.execute({
      userBookId: id,
      status,
      isFavorite,
      bookshelfId,
      imageUrl,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async uploadUserBookImage(
    request: HttpRequest<undefined, undefined, UploadUserBookImagePathParamsDto>,
  ): Promise<HttpOkResponse<UploadUserBookImageResponseBodyDtoSchema>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    if (!request.file) {
      throw new OperationNotValidError({
        reason: 'No file attached',
      });
    }

    const { userBook } = await this.uploadUserBookImageCommandHandler.execute({
      userBookId: id,
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
    const { bookId, bookshelfId, status, imageUrl, isFavorite } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBook } = await this.createUserBookCommandHandler.execute({
      bookId,
      bookshelfId,
      status,
      imageUrl,
      isFavorite,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async findUserBook(
    request: HttpRequest<undefined, undefined, FindUserBookPathParamsDto>,
  ): Promise<HttpOkResponse<FindUserBookResponseBodyDto>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBook } = await this.findUserBookQueryHandler.execute({ userBookId: id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private async findUserBooksByBookshelfId(
    request: HttpRequest<undefined, FindUserBooksByBookshelfIdQueryParamsDto, FindUserBooksByBookshelfIdPathParamsDto>,
  ): Promise<HttpOkResponse<FindUserBooksByBookshelfIdResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { userBooks, total } = await this.findUserBooksQueryHandler.execute({
      ids: [],
      bookshelfId,
      userId,
      page,
      pageSize,
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

  private async deleteUserBooks(
    request: HttpRequest<undefined, DeleteUserBooksQueryParamsDto, undefined>,
  ): Promise<HttpNoContentResponse<DeleteUserBooksResponseBodyDto>> {
    const { ids } = request.queryParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    await this.deleteUserBookCommandHandler.execute({ userBookIds: ids });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async updateUserBookGenres(
    request: HttpRequest<UpdateUserBookGenresBodyDto, undefined, UpdateUserBookGenresPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateUserBookGenresResponseBodyDtoSchema>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { genreIds } = request.body;

    const { userBook } = await this.updateUserBookGenresCommandHandler.execute({
      userBookId,
      genreIds,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDto(userBook),
    };
  }

  private mapUserBookToUserBookDto(userBook: UserBook): UserBookDto {
    const { status, isFavorite, bookshelfId, imageUrl, bookId, genres, book } = userBook.getState();

    const userBookDto: UserBookDto = {
      id: userBook.getId(),
      status,
      isFavorite,
      bookshelfId,
      bookId,
      book: {
        title: book?.title as string,
        language: book?.language as Language,
        isApproved: book?.isApproved as boolean,
        format: book?.format as BookFormat,
        authors:
          book?.authors.map((author) => ({
            id: author.getId(),
            name: author.getName(),
            isApproved: author.getIsApproved(),
          })) || [],
      },
      genres:
        genres.map((genre) => ({
          id: genre.getId(),
          name: genre.getName(),
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
