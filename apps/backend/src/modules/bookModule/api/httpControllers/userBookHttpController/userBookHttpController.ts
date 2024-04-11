import { type BookFormat } from '@common/contracts';

import {
  createUserBookBodyDTOSchema,
  createUserBookResponseBodyDTOSchema,
  type CreateUserBookBodyDTO,
  type CreateUserBookResponseBodyDTO,
} from './schemas/createUserBookSchema.js';
import {
  deleteUserBookPathParamsDTOSchema,
  deleteUserBookResponseBodyDTOSchema,
  type DeleteUserBookPathParamsDTO,
} from './schemas/deleteUserBookSchema.js';
import {
  findUserBooksByBookshelfIdPathParamsDTOSchema,
  findUserBooksByBookshelfIdResponseBodyDTOSchema,
  type FindUserBooksByBookshelfIdPathParamsDTO,
  type FindUserBooksByBookshelfIdResponseBodyDTO,
} from './schemas/findUserBooksByBookshelfIdSchema.js';
import {
  findUserBookPathParamsDTOSchema,
  findUserBookResponseBodyDTOSchema,
  type FindUserBookPathParamsDTO,
  type FindUserBookResponseBodyDTO,
} from './schemas/findUserBookSchema.js';
import {
  updateUserBookGenresBodyDTOSchema,
  updateUserBookGenresPathParamsDTOSchema,
  updateUserBookGenresResponseDTOSchema,
  type UpdateUserBookGenresBodyDTO,
  type UpdateUserBookGenresPathParamsDTO,
  type UpdateUserBookGenresResponseDTOSchema,
} from './schemas/updateUserBookGenresSchema.js';
import {
  updateUserBookPathParamsDTOSchema,
  updateUserBookBodyDTOSchema,
  updateUserBookResponseDTOSchema,
  type UpdateUserBookBodyDTO,
  type UpdateUserBookPathParamsDTO,
  type UpdateUserBookResponseDTOSchema,
} from './schemas/updateUserBookSchema.js';
import { type UserBookDTO } from './schemas/userBookDTO.js';
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
import { type UpdateUserBookGenresCommandHandler } from '../../../application/commandHandlers/updateUserBookGenresCommandHandler/updateUserBookGenresCommandHandler.js';
import { type FindUserBookQueryHandler } from '../../../application/queryHandlers/findUserBookQueryHandler/findUserBookQueryHandler.js';
import { type FindUserBooksQueryHandler } from '../../../application/queryHandlers/findUserBooksQueryHandler/findUserBooksQueryHandler.js';
import { type BookState } from '../../../domain/entities/book/book.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';
import { type DeleteBookResponseBodyDTO } from '../bookHttpController/schemas/deleteBookSchema.js';

export class UserBookHttpController implements HttpController {
  public readonly basePath = '/api/users/:userId/books';
  public readonly tags = ['UserBook'];

  public constructor(
    private readonly createUserBookCommandHandler: CreateUserBookCommandHandler,
    private readonly updateUserBookCommandHandler: UpdateUserBookCommandHandler,
    private readonly deleteUserBookCommandHandler: DeleteUserBookCommandHandler,
    private readonly findUserBookQueryHandler: FindUserBookQueryHandler,
    private readonly findUserBooksQueryHandler: FindUserBooksQueryHandler,
    private readonly updateUserBookGenresCommandHandler: UpdateUserBookGenresCommandHandler,
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
            body: createUserBookBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createUserBookResponseBodyDTOSchema,
              description: `User's book created.`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: `Create user's book.`,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findUserBook.bind(this),
        schema: {
          request: {
            pathParams: findUserBookPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserBookResponseBodyDTOSchema,
              description: `User's book found.`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: `Find user's book by id.`,
      }),
      //TODO: refactor to search params
      new HttpRoute({
        method: HttpMethodName.get,
        path: '/bookshelf/:bookshelfId',
        handler: this.findUserBooksByBookshelfId.bind(this),
        description: `Find user's books by bookshelf id.`,
        schema: {
          request: {
            pathParams: findUserBooksByBookshelfIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserBooksByBookshelfIdResponseBodyDTOSchema,
              description: `User's books found.`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteUserBook.bind(this),
        schema: {
          request: {
            pathParams: deleteUserBookPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserBookResponseBodyDTOSchema,
              description: `User's book deleted.`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: `Delete user's book.`,
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        description: `Update user's book.`,
        handler: this.updateUserBook.bind(this),
        schema: {
          request: {
            pathParams: updateUserBookPathParamsDTOSchema,
            body: updateUserBookBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: `User's book updated.`,
              schema: updateUserBookResponseDTOSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':userBookId/genres',
        description: `Update user's book genres.`,
        handler: this.updateUserBookGenres.bind(this),
        schema: {
          request: {
            pathParams: updateUserBookGenresPathParamsDTOSchema,
            body: updateUserBookGenresBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: `User's book genres updated.`,
              schema: updateUserBookGenresResponseDTOSchema,
            },
          },
        },
      }),
    ];
  }

  private async updateUserBook(
    request: HttpRequest<UpdateUserBookBodyDTO, undefined, UpdateUserBookPathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateUserBookResponseDTOSchema>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { status, bookshelfId, imageUrl } = request.body;

    const { userBook } = await this.updateUserBookCommandHandler.execute({
      userBookId: id,
      status,
      bookshelfId,
      imageUrl,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDTO(userBook),
    };
  }

  private async createUserBook(
    request: HttpRequest<CreateUserBookBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateUserBookResponseBodyDTO>> {
    const { bookId, bookshelfId, status, imageUrl } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBook } = await this.createUserBookCommandHandler.execute({
      bookId,
      bookshelfId,
      status,
      imageUrl,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapUserBookToUserBookDTO(userBook),
    };
  }

  private async findUserBook(
    request: HttpRequest<undefined, undefined, FindUserBookPathParamsDTO>,
  ): Promise<HttpOkResponse<FindUserBookResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBook } = await this.findUserBookQueryHandler.execute({ userBookId: id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserBookToUserBookDTO(userBook),
    };
  }

  private async findUserBooksByBookshelfId(
    request: HttpRequest<undefined, undefined, FindUserBooksByBookshelfIdPathParamsDTO>,
  ): Promise<HttpOkResponse<FindUserBooksByBookshelfIdResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    const { userBooks } = await this.findUserBooksQueryHandler.execute({
      ids: [],
      bookshelfId,
      userId,
    });

    return {
      body: {
        data: userBooks.map((userBook) => this.mapUserBookToUserBookDTO(userBook)),
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async deleteUserBook(
    request: HttpRequest<undefined, undefined, DeleteUserBookPathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    await this.deleteUserBookCommandHandler.execute({ userBookId: id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async updateUserBookGenres(
    request: HttpRequest<UpdateUserBookGenresBodyDTO, undefined, UpdateUserBookGenresPathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateUserBookGenresResponseDTOSchema>> {
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
      body: this.mapUserBookToUserBookDTO(userBook),
    };
  }

  private mapUserBookToUserBookDTO(userBook: UserBook): UserBookDTO {
    const userBookDto: UserBookDTO = {
      id: userBook.getId(),
      status: userBook.getStatus(),
      bookshelfId: userBook.getBookshelfId(),
      bookId: userBook.getBookId(),
      book: {
        title: userBook.getBook()?.title as string,
        language: userBook.getBook()?.language as string,
        isApproved: userBook.getBook()?.isApproved as boolean,
        format: userBook.getBook()?.format as BookFormat,
        authors:
          userBook.getBook()?.authors.map((author) => ({
            id: author.getId(),
            name: author.getName(),
            isApproved: author.getIsApproved(),
          })) || [],
      },
      genres:
        userBook.getGenres().map((genre) => ({
          id: genre.getId(),
          name: genre.getName(),
        })) || [],
    };

    const { isbn, pages, publisher, releaseYear, translator } = userBook.getBook() as BookState;

    if (isbn) {
      userBookDto.book.isbn = isbn;
    }

    if (publisher) {
      userBookDto.book.publisher = publisher;
    }

    if (releaseYear) {
      userBookDto.book.releaseYear = releaseYear;
    }

    if (translator) {
      userBookDto.book.translator = translator;
    }

    if (pages) {
      userBookDto.book.pages = pages;
    }

    const imageUrl = userBook.getImageUrl();

    if (imageUrl) {
      userBookDto.imageUrl = imageUrl;
    }

    return userBookDto;
  }
}
