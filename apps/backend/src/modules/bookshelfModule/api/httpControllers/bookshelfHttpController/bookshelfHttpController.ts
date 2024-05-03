import { type BookshelfDTO } from './schemas/bookshelfDto.js';
import {
  type CreateBookshelfBodyDTO,
  type CreateBookshelfResponseBodyDTO,
  createBookshelfBodyDTOSchema,
  createBookshelfResponseBodyDTOSchema,
} from './schemas/createBookshelfSchema.js';
import {
  type DeleteBookshelfPathParamsDTO,
  type DeleteBookshelfResponseBodyDTO,
  deleteBookshelfPathParamsDTOSchema,
  deleteBookshelfResponseBodyDTOSchema,
} from './schemas/deleteBookshelfSchema.js';
import {
  type FindBookshelfByIdResponseBodyDTO,
  type FindBookshelfByIdPathParamsDTO,
  findBookshelfByIdResponseBodyDTOSchema,
  findBookshelfByIdPathParamsDTOSchema,
} from './schemas/findBookshelfByIdSchema.js';
import {
  type FindBookshelvesByUserIdResponseBodyDTO,
  findBookshelvesByUserIdResponseBodyDTOSchema,
  type FindBookshelvesByUserIdQueryParamsDTO,
} from './schemas/findBookshelvesByUserIdSchema.js';
import {
  type UpdateBookshelfPathParamsDTO,
  type UpdateBookshelfBodyDTO,
  type UpdateBookshelfResponseBodyDTO,
  updateBookshelfBodyDTOSchema,
  updateBookshelfPathParamsDTOSchema,
  updateBookshelfResponseBodyDTOSchema,
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

interface MapBookshelfToBookshelfDTOPayload {
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
              schema: findBookshelvesByUserIdResponseBodyDTOSchema,
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
            pathParams: findBookshelfByIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookshelfByIdResponseBodyDTOSchema,
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
            body: createBookshelfBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Bookshelf created',
              schema: createBookshelfResponseBodyDTOSchema,
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
            body: updateBookshelfBodyDTOSchema,
            pathParams: updateBookshelfPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Bookshelf updated',
              schema: updateBookshelfResponseBodyDTOSchema,
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
            pathParams: deleteBookshelfPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Bookshelf deleted',
              schema: deleteBookshelfResponseBodyDTOSchema,
            },
          },
        },
      }),
    ];
  }

  private async getUserBookshelves(
    request: HttpRequest<undefined, FindBookshelvesByUserIdQueryParamsDTO, undefined>,
  ): Promise<HttpOkResponse<FindBookshelvesByUserIdResponseBodyDTO>> {
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
        data: bookshelves.map((bookshelf) => this.mapBookshelfToBookshelfDTO({ bookshelf })),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async getBookshelf(
    request: HttpRequest<undefined, undefined, FindBookshelfByIdPathParamsDTO>,
  ): Promise<HttpOkResponse<FindBookshelfByIdResponseBodyDTO>> {
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
      body: this.mapBookshelfToBookshelfDTO({ bookshelf }),
    };
  }

  private async createBookshelf(
    request: HttpRequest<CreateBookshelfBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookshelfResponseBodyDTO>> {
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
      body: this.mapBookshelfToBookshelfDTO({ bookshelf }),
    };
  }

  private async updateBookshelf(
    request: HttpRequest<UpdateBookshelfBodyDTO, undefined, UpdateBookshelfPathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateBookshelfResponseBodyDTO>> {
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
      body: this.mapBookshelfToBookshelfDTO({ bookshelf }),
    };
  }

  private async deleteBookshelf(
    request: HttpRequest<undefined, undefined, DeleteBookshelfPathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteBookshelfResponseBodyDTO>> {
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

  private mapBookshelfToBookshelfDTO(payload: MapBookshelfToBookshelfDTOPayload): BookshelfDTO {
    const { bookshelf } = payload;

    return {
      id: bookshelf.getId(),
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
    };
  }
}
