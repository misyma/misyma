import { type BookshelfDto } from './schemas/bookshelfDto.js';
import {
  type CreateBookshelfBodyDto,
  type CreateBookshelfResponseBodyDto,
  createBookshelfBodyDtoSchema,
  createBookshelfResponseBodyDtoSchema,
} from './schemas/createBookshelfSchema.js';
import {
  type DeleteBookshelfPathParamsDto,
  type DeleteBookshelfResponseBodyDto,
  deleteBookshelfPathParamsDtoSchema,
  deleteBookshelfResponseBodyDtoSchema,
} from './schemas/deleteBookshelfSchema.js';
import {
  type FindBookshelfByIdResponseBodyDto,
  type FindBookshelfByIdPathParamsDto,
  findBookshelfByIdResponseBodyDtoSchema,
  findBookshelfByIdPathParamsDtoSchema,
} from './schemas/findBookshelfByIdSchema.js';
import {
  type FindBookshelvesByUserIdResponseBodyDto,
  findBookshelvesByUserIdResponseBodyDtoSchema,
  type FindBookshelvesByUserIdQueryParamsDto,
} from './schemas/findBookshelvesByUserIdSchema.js';
import {
  type UpdateBookshelfPathParamsDto,
  type UpdateBookshelfBodyDto,
  type UpdateBookshelfResponseBodyDto,
  updateBookshelfBodyDtoSchema,
  updateBookshelfPathParamsDtoSchema,
  updateBookshelfResponseBodyDtoSchema,
} from './schemas/updateBookshelfSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpNoContentResponse,
  type HttpCreatedResponse,
  type HttpOkResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookshelfCommandHandler } from '../../../application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandler.js';
import { type DeleteBookshelfCommandHandler } from '../../../application/commandHandlers/deleteBookshelfCommandHandler/deleteBookshelfCommandHandler.js';
import { type UpdateBookshelfCommandHandler } from '../../../application/commandHandlers/updateBookshelfCommandHandler/updateBookshelfCommandHandler.js';
import { type FindBookshelfByIdQueryHandler } from '../../../application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { type FindBookshelvesByUserIdQueryHandler } from '../../../application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

interface MapBookshelfToBookshelfDtoPayload {
  readonly bookshelf: Bookshelf;
}

export class BookshelfHttpController implements HttpController {
  public readonly basePath = '/api/bookshelves';
  public readonly tags = ['Bookshelf'];

  public constructor(
    private readonly findBookshelvesByUserIdQueryHandler: FindBookshelvesByUserIdQueryHandler,
    private readonly findBookshelfByIdQueryHandler: FindBookshelfByIdQueryHandler,
    private readonly createBookshelfCommandHandler: CreateBookshelfCommandHandler,
    private readonly updateBookshelfCommandHandler: UpdateBookshelfCommandHandler,
    private readonly deleteBookshelfCommandHandler: DeleteBookshelfCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.getUserBookshelves.bind(this),
        description: 'Get user bookshelves',
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookshelvesByUserIdResponseBodyDtoSchema,
              description: 'Found user bookshelves',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':bookshelfId',
        handler: this.getBookshelf.bind(this),
        schema: {
          request: {
            pathParams: findBookshelfByIdPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookshelfByIdResponseBodyDtoSchema,
              description: 'Found bookshelf',
            },
          },
        },
        description: 'Get a bookshelf by id',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBookshelf.bind(this),
        description: 'Create a bookshelf',
        schema: {
          request: {
            body: createBookshelfBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Bookshelf created',
              schema: createBookshelfResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: '/:bookshelfId',
        handler: this.updateBookshelf.bind(this),
        description: 'Update bookshelf',
        schema: {
          request: {
            body: updateBookshelfBodyDtoSchema,
            pathParams: updateBookshelfPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Bookshelf updated',
              schema: updateBookshelfResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: '/:bookshelfId',
        handler: this.deleteBookshelf.bind(this),
        description: 'Delete bookshelf',
        schema: {
          request: {
            pathParams: deleteBookshelfPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Bookshelf deleted',
              schema: deleteBookshelfResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async getUserBookshelves(
    request: HttpRequest<undefined, FindBookshelvesByUserIdQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindBookshelvesByUserIdResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { bookshelves, total } = await this.findBookshelvesByUserIdQueryHandler.execute({
      userId,
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: bookshelves.map((bookshelf) => this.mapBookshelfToBookshelfDto({ bookshelf })),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async getBookshelf(
    request: HttpRequest<undefined, undefined, FindBookshelfByIdPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookshelfByIdResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    const { bookshelf } = await this.findBookshelfByIdQueryHandler.execute({
      bookshelfId,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookshelfToBookshelfDto({ bookshelf }),
    };
  }

  private async createBookshelf(
    request: HttpRequest<CreateBookshelfBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookshelfResponseBodyDto>> {
    const { name } = request.body;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelf } = await this.createBookshelfCommandHandler.execute({
      name,
      userId,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookshelfToBookshelfDto({ bookshelf }),
    };
  }

  private async updateBookshelf(
    request: HttpRequest<UpdateBookshelfBodyDto, undefined, UpdateBookshelfPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookshelfResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    const { name } = request.body;

    const { bookshelf } = await this.updateBookshelfCommandHandler.execute({
      bookshelfId,
      name,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookshelfToBookshelfDto({ bookshelf }),
    };
  }

  private async deleteBookshelf(
    request: HttpRequest<undefined, undefined, DeleteBookshelfPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookshelfResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    await this.deleteBookshelfCommandHandler.execute({
      bookshelfId,
      userId,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapBookshelfToBookshelfDto(payload: MapBookshelfToBookshelfDtoPayload): BookshelfDto {
    const { bookshelf } = payload;

    return {
      id: bookshelf.getId(),
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
    };
  }
}
